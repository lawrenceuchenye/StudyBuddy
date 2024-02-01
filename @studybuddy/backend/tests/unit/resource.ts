import ResourceRepository from "@studybuddy/backend/repositories/resource";
import { Types } from "mongoose";
import { describe, test, expect } from "vitest";
import Database from "@studybuddy/backend/utils/database";
import { ulid } from "ulidx";
import { File } from '@web-std/file'
import ResourceSeeder from "../seeders/resource";
import MediaRepository from "@studybuddy/backend/repositories/media";

describe("Resources unit test", async () => {
  await Database.start()

  const userId = new Types.ObjectId()

  let creatorId: Types.ObjectId
  let memberId: Types.ObjectId
  let resourceId: Types.ObjectId

  const resourcePayload = ResourceSeeder.seed()

  const newResource = {
    name: ulid(),
    subjects: [ulid(), ulid(), ulid()],
    description: ulid()
  }

  let resourcesCount: number

  test("that resources can be retrieved", async () => {
    const resources = await ResourceRepository.getResources({
      page: 1,
      perPage: 10
    })

    resourcesCount = resources.meta.total
  })

  test("that a resource can be created", async () => {
    const { media, ...rest } = resourcePayload
    const mediaIds = await Promise.all(
      media
        .map(async (media) => {
          const mediaId = await MediaRepository.createMedia(media)
          return mediaId._id
        })
    )
    const resource = await ResourceRepository.createResource({
      ...rest,
      mediaIds,
      creatorId: userId,
    })

    expect(resource.title).to.equal(resource.title)
    expect(resource.shortDescription).to.equal(resource.shortDescription)
    expect(resource.longDescription).to.equal(resource.longDescription)
    expect(resource.subjects).to.deep.equal(resource.subjects)

    resourceId = resource._id
    creatorId = resource.creatorId
  })

  test("that the count of resources has increased", async () => {
    const resources = await ResourceRepository.getResources({
      page: 1,
      perPage: 10
    })

    expect(resources.meta.total).to.equal(resourcesCount + 1)
    resourcesCount = resources.meta.total
  })

  test("that only resources with a matching subject can be retrieved", async () => {
    const resources = await ResourceRepository.getResources({ page: 1, perPage: 10 }, { subjects: resourcePayload.subjects.slice(0, 1) })

    expect(resources.data).to.have.lengthOf(1)
    expect(resources.meta.total).to.equal(1)
  })

  test("that only resources with a matching title can be retrieved", async () => {
    const resources = await ResourceRepository.getResources({ page: 1, perPage: 10 }, { title: resourcePayload.title })

    expect(resources.data).to.have.lengthOf(1)
    expect(resources.meta.total).to.equal(1)
  })

  test("that a resource can be updated", async () => {
    await ResourceRepository.updateResource({
      ...newResource,
      id: resourceId
    })

    const resource = await ResourceRepository.getResource({
      id: resourceId
    })

    if (!resource)
      throw new Error("Resource not found!")

    expect(resource.title).to.equal(resource.title)
    expect(resource.shortDescription).to.equal(resource.shortDescription)
    expect(resource.longDescription).to.equal(resource.longDescription)
    expect(resource.subjects).to.deep.equal(resource.subjects)

  })

  test("that a resource can be deleted", async () => {
    await ResourceRepository.deleteResource({
      id: resourceId,
    })

    const resource = await ResourceRepository.getResource({
      id: resourceId
    })

    expect(resource).to.be.null
  })

  test("that the count of resources has decreased", async () => {
    const resources = await ResourceRepository.getResources({
      page: 1,
      perPage: 10
    })

    expect(resources.meta.total).to.equal(resourcesCount - 1)
    resourcesCount = resources.meta.total
  })
})
