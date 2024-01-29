import { afterAll, describe, expect, test } from "vitest";
import UserSeeder from "../seeders/user";
import { client } from "../setup";
import StudyGroupSeeder from "../seeders/study-group";
import Token from "@studybuddy/backend/utils/token";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import Database from "@studybuddy/backend/utils/database";
import { ulid } from "ulidx";
import { File } from "@web-std/file";

describe("Study groups integration test", async () => {
  await Database.start()

  const TOTAL_MEMBERS = 9
  const MEMBERS_REMOVED_BY_CREATOR = 3
  const MEMBERS_LEFT_BY_THEMSELVES = 2

  const [creator, ...members] = await Promise.all(Array(TOTAL_MEMBERS + 1)
    .fill(null)
    .map(async (_) => {
      const member = await UserSeeder.generate()
      const token = await Token.generateAccessToken(member)

      return {
        data: member,
        token,
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    }))

  let membersCount = 0

  const studyGroupPayload = {
    old: StudyGroupSeeder.seed(),
    new: StudyGroupSeeder.seed()
  }
  let studyGroupId: string

  afterAll(async () => {
    for (const member of members) {
      await member.data.destroy()
    }
    await creator.data.destroy()
  })

  test("that a study group can be created", async () => {
    const res = await client["study-group"].$post({
      json: studyGroupPayload.old,
    }, {
      headers: creator.headers
    })

    const data = await res.json()

    studyGroupId = data.data._id

    expect(res.status).to.equal(201)
  })

  test("that a study group can be retrieved", async () => {
    const res = await client["study-group"].$get()

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.data).to.be.instanceOf(Array)
  })

  test("that a study group cannot be updated by a random user", async () => {
    const res = await client["study-group"][":id"].$patch({
      param: {
        id: studyGroupId
      },
      json: studyGroupPayload.new
    }, {
      headers: members[0].headers
    })

    // because the user is not in the studyGroup
    expect(res.status).to.equal(StatusCodes.NOT_FOUND)
  })

  test("that a study group can be updated by the creator", async () => {
    const res = await client["study-group"][":id"].$patch({
      param: {
        id: studyGroupId
      },
      json: studyGroupPayload.new
    }, {
      headers: creator.headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })

  test("that the study group has been updated", async () => {
    const res = await client["study-group"][":id"].$get({
      param: {
        id: studyGroupId
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.data.name).to.equal(studyGroupPayload.new.name)
  })

  test("that the list of members can be gotten for a study group", async () => {
    const res = await client["study-group"][":id"].members.$get({
      param: {
        id: studyGroupId
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    // 1 because the creator is automatically added to the studyGroup
    expect(json.meta.total).to.equal(1)

    membersCount = json.meta.total
  })

  test("that users can be added to a study group by the creator", async () => {
    for (const member of members) {
      const res = await client["study-group"][":studyGroupId"].members[":memberId"].$post({
        param: {
          studyGroupId,
          memberId: member.data._id.toString()
        }
      }, {
        headers: creator.headers
      })

      const json = await res.json()

      expect(res.status).to.equal(StatusCodes.OK)
      expect(json.data).to.be.instanceOf(Object)
    }
  })

  test("that a study group cannot be updated by a random user/member", async () => {
    const res = await client["study-group"][":id"].$patch({
      param: {
        id: studyGroupId
      },
      json: studyGroupPayload.new
    }, {
      headers: members[0].headers
    })

    // because the user is not in the studyGroup
    expect(res.status).to.equal(StatusCodes.FORBIDDEN)
  })

  test("that the number of study group members has gone up", async () => {
    const res = await client["study-group"][":id"].members.$get({
      param: {
        id: studyGroupId,
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.meta.total).to.equal(membersCount + TOTAL_MEMBERS)

    membersCount = json.meta.total
  })

  test("that users can be gotten from the study group", async () => {
    for (const member of members) {
      const res = await client["study-group"].$get({
        param: {
          studyGroupId,
          memberId: member.data._id.toString()
        }
      })

      const json = await res.json()

      expect(res.status).to.equal(StatusCodes.OK)
      expect(json.data).to.be.instanceOf(Object)
    }
  })

  test("that a random user cannot be gotten from the study group", async () => {
    const res = await client["study-group"][":studyGroupId"].members[":memberId"].$get({
      param: {
        studyGroupId,
        memberId: new Types.ObjectId().toString()
      }
    })

    expect(res.status).to.equal(StatusCodes.NOT_FOUND)
  })

  test("that members can be removed from a study group by the creator", async () => {
    for (const member of members.splice(0, MEMBERS_REMOVED_BY_CREATOR)) {
      const res = await client["study-group"][":studyGroupId"].members[":memberId"].$delete({
        param: {
          studyGroupId,
          memberId: member.data._id.toString()
        }
      }, {
        headers: creator.headers
      })

      expect(res.status).to.equal(StatusCodes.OK)
    }
  })

  test("that the number of study group members has gone down", async () => {
    const res = await client["study-group"][":id"].members.$get({
      param: {
        id: studyGroupId,
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.meta.total).to.be.equal(membersCount - MEMBERS_REMOVED_BY_CREATOR)

    membersCount = json.meta.total
  })

  test("that members can leave a study group by themselves", async () => {
    for (const member of members.splice(0, MEMBERS_LEFT_BY_THEMSELVES)) {
      const res = await client["study-group"][":id"].leave.$post({
        param: {
          id: studyGroupId
        }
      }, {
        headers: member.headers
      })

      expect(res.status).to.equal(StatusCodes.OK)
    }
  })

  test("that the number of study group members has gone down", async () => {
    const res = await client["study-group"][":id"].members.$get({
      param: {
        id: studyGroupId,
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.meta.total).to.be.equal(membersCount - MEMBERS_LEFT_BY_THEMSELVES)

    membersCount = json.meta.total
  })

  test("that a member can post to the study group", async () => {
    const url = client["study-group"][":id"].messages.$url({
      param: {
        id: studyGroupId
      }
    })

    const formData = new FormData()

    formData.append("content", ulid())
    formData.append("media[]", new File(["content"], ulid(), { type: "text/plain" }))
    formData.append("media[]", new File(["content"], ulid(), { type: "text/plain" }))

    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: members[1].headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })

  test("that a study group can be deleted", async () => {
    const res = await client["study-group"][":id"].$delete({
      param: {
        id: studyGroupId
      }
    }, {
      headers: creator.headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })
})
