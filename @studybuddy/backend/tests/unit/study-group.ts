import StudyGroupRepository from "@studybuddy/backend/repositories/study-group";
import { Types } from "mongoose";
import { describe, test, expect } from "vitest";
import Database from "@studybuddy/backend/utils/database";
import { ulid } from "ulidx";
import { File } from '@web-std/file'
import UserSeeder from "../seeders/user";
import MediaRepository from "@studybuddy/backend/repositories/media";

describe("Study groups unit test", async () => {
  await Database.start()

  const userId = new Types.ObjectId()
  const user2 = await UserSeeder.generate()

  let creatorId: Types.ObjectId
  let memberId: Types.ObjectId
  let studyGroupId: Types.ObjectId

  const studyGroupPayload = {
    name: ulid(),
    subjects: [ulid(), ulid(), ulid()],
    description: ulid()
  }

  const newStudyGroup = {
    name: ulid(),
    subjects: [ulid(), ulid(), ulid()],
    description: ulid()
  }

  let studyGroupsCount: number

  test("that study groups can be retrieved", async () => {
    const studyGroups = await StudyGroupRepository.getStudyGroups({
      page: 1,
      perPage: 10
    })

    studyGroupsCount = studyGroups.meta.total
  })

  test("that a study group can be created", async () => {
    const studyGroup = await StudyGroupRepository.createStudyGroup({
      ...studyGroupPayload,
      creatorId: userId,
    })

    expect(studyGroup.name).to.equal(studyGroup.name)
    expect(studyGroup.description).to.equal(studyGroup.description)
    expect(studyGroup.subjects).to.deep.equal(studyGroup.subjects)

    studyGroupId = studyGroup._id
    creatorId = studyGroup.creatorId
  })

  test("that the count of study groups has increased", async () => {
    const studyGroups = await StudyGroupRepository.getStudyGroups({
      page: 1,
      perPage: 10
    })

    expect(studyGroups.meta.total).to.equal(studyGroupsCount + 1)
    studyGroupsCount = studyGroups.meta.total
  })

  test("that only study groups with a matching subject can be retrieved", async () => {
    const studyGroups = await StudyGroupRepository.getStudyGroups({ page: 1, perPage: 10 }, { subjects: studyGroupPayload.subjects.slice(0, 1) })

    expect(studyGroups.data).to.have.lengthOf(1)
    expect(studyGroups.meta.total).to.equal(1)
  })

  test("that only study groups with a matching name can be retrieved", async () => {
    const studyGroups = await StudyGroupRepository.getStudyGroups({ page: 1, perPage: 10 }, { name: studyGroupPayload.name })

    expect(studyGroups.data).to.have.lengthOf(1)
    expect(studyGroups.meta.total).to.equal(1)
  })

  test("that a study group can be updated", async () => {
    await StudyGroupRepository.updateStudyGroup({
      ...newStudyGroup,
      id: studyGroupId
    })

    const studyGroup = await StudyGroupRepository.getStudyGroup({
      id: studyGroupId
    })

    if (!studyGroup)
      throw new Error("StudyGroup not found!")

    expect(studyGroup.name).to.equal(newStudyGroup.name)
    expect(studyGroup.description).to.equal(newStudyGroup.description)
    expect(studyGroup.subjects).to.deep.equal(newStudyGroup.subjects)
  })

  test("that members of a study group can be fetched", async () => {
    const studyGroupUsers = await StudyGroupRepository.getMembers({
      id: studyGroupId,
    }, { page: 1, perPage: 10 })

    expect(studyGroupUsers.data).to.have.lengthOf(1)
    expect(studyGroupUsers.meta.total).to.equal(1)
  })

  test("that a user can be added to a study group", async () => {
    const studyGroupUser = await StudyGroupRepository.addMember(user2._id, {
      studyGroupId,
    })

    memberId = studyGroupUser._id
  })

  test("that number of study group members has increased", async () => {
    const studyGroupUsers = await StudyGroupRepository.getMembers({
      id: studyGroupId,
    }, { page: 1, perPage: 10 })

    expect(studyGroupUsers.data).to.have.lengthOf(2)
    expect(studyGroupUsers.meta.total).to.equal(2)
  })

  test("that a member send a message to the study group", async () => {
    const mediaIds = [
      await MediaRepository
        .createMedia(
          new File(["content"], ulid(), { type: "text/plain" }),
        ),
      await MediaRepository
        .createMedia(
          new File(["content"], ulid(), { type: "text/plain" })
        )
    ]
      .map(media => media._id)

    await StudyGroupRepository.sendMessage({
      senderId: memberId,
      studyGroupId,
      content: ulid(),
      mediaIds
    })
  })

  test("that a user can be removed from a study group", async () => {
    await StudyGroupRepository.removeMember({
      studyGroupId,
      userId: memberId,
    })
  })

  test("that number of study group members has decreased", async () => {
    const studyGroupUsers = await StudyGroupRepository.getMembers({
      id: studyGroupId
    }, { page: 1, perPage: 10 })

    expect(studyGroupUsers.data).to.have.lengthOf(1)
    expect(studyGroupUsers.meta.total).to.equal(1)
  })

  test("that a study group can be deleted", async () => {
    await StudyGroupRepository.deleteStudyGroup({
      id: studyGroupId,
    })

    const studyGroup = await StudyGroupRepository.getStudyGroup({
      id: studyGroupId
    })

    expect(studyGroup).to.be.null
  })

  test("that the count of study groups has decreased", async () => {
    const studyGroups = await StudyGroupRepository.getStudyGroups({
      page: 1,
      perPage: 10
    })

    expect(studyGroups.meta.total).to.equal(studyGroupsCount - 1)
    studyGroupsCount = studyGroups.meta.total
  })
})
