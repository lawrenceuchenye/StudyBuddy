import { afterAll, describe, expect, test } from "vitest";
import UserSeeder from "../seeders/user";
import { client } from "../setup";
import ChannelSeeder from "../seeders/channel";
import TokenServive from "@studybuddy/backend/services/token";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import Database from "@studybuddy/backend/utils/database";
import { ulid } from "ulidx";
import { File } from "@web-std/file";
import MediaRepository from "@studybuddy/backend/repositories/media";

describe("Channels integration test", async () => {
  await Database.start()

  const TOTAL_MEMBERS = 9
  const MEMBERS_REMOVED_BY_CREATOR = 3
  const MEMBERS_LEFT_BY_THEMSELVES = 2

  const [creator, ...members] = await Promise.all(Array(TOTAL_MEMBERS + 1)
    .fill(null)
    .map(async (_) => {
      const member = await UserSeeder.generate()
      const token = await TokenServive.generateAccessToken(member)

      return {
        data: member,
        payload: {
          new: UserSeeder.seed(),
          old: UserSeeder.seed()
        },
        token,
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    }))

  let membersCount = 0

  const channelPayload = {
    old: ChannelSeeder.seed(),
    new: ChannelSeeder.seed()
  }
  let channelId: string

  afterAll(async () => {
    for (const member of members) {
      await member.data.destroy()
    }
    await creator.data.destroy()
  })

  test("that a channel can be created", async () => {
    const res = await client.channels.$post({
      json: channelPayload.old,
    }, {
      headers: creator.headers
    })

    const data = await res.json()

    channelId = data.data._id

    expect(res.status).to.equal(201)
  })

  test("that a channel can be retrieved", async () => {
    const res = await client.channels.$get()

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.data).to.be.instanceOf(Array)
  })

  test("that a channel cannot be updated by a random user", async () => {
    const res = await client.channels[":id"].$patch({
      param: {
        id: channelId
      },
      json: channelPayload.new
    }, {
      headers: members[0].headers
    })

    // because the user is not in the channel
    expect(res.status).to.equal(StatusCodes.NOT_FOUND)
  })

  test("that a channel can be updated by the creator", async () => {
    const res = await client.channels[":id"].$patch({
      param: {
        id: channelId
      },
      json: channelPayload.new
    }, {
      headers: creator.headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })

  test("that the channel has been updated", async () => {
    const res = await client.channels[":id"].$get({
      param: {
        id: channelId
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.data.name).to.equal(channelPayload.new.name)
  })

  test("that the list of members can be gotten for a channel", async () => {
    const res = await client.channels[":id"].members.$get({
      param: {
        id: channelId
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    // 1 because the creator is automatically added to the channel
    expect(json.meta.total).to.equal(1)

    membersCount = json.meta.total
  })

  test("that users can be added to a channel by the creator", async () => {
    for (const member of members) {
      const res = await client.channels[":id"].members.join.$post({
        param: {
          id: channelId
        }
      }, {
        headers: member.headers
      })

      const json = await res.json()

      expect(res.status).to.equal(StatusCodes.OK)
      expect(json.data).to.be.instanceOf(Object)
    }
  })

  test("that a channel cannot be updated by a random user", async () => {
    const res = await client.channels[":id"].$patch({
      param: {
        id: channelId
      },
      json: channelPayload.new
    }, {
      headers: members[0].headers
    })

    // because the user is not in the channel
    expect(res.status).to.equal(StatusCodes.FORBIDDEN)
  })

  test("that the number of channel members has gone up", async () => {
    const res = await client.channels[":id"].members.$get({
      param: {
        id: channelId,
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.meta.total).to.equal(membersCount + TOTAL_MEMBERS)

    membersCount = json.meta.total
  })

  test("that users can be gotten from the channel", async () => {
    for (const member of members) {
      const res = await client.channels[":id"].members[":memberId"].$get({
        param: {
          id: channelId,
          memberId: member.data._id.toString()
        }
      })

      const json = await res.json()

      expect(res.status).to.equal(StatusCodes.OK)
      expect(json.data).to.be.instanceOf(Object)
    }
  })

  test("that a random user cannot be gotten from the channel", async () => {
    const res = await client.channels[":id"].members[":memberId"].$get({
      param: {
        id: channelId,
        memberId: new Types.ObjectId().toString()
      }
    })

    expect(res.status).to.equal(StatusCodes.NOT_FOUND)
  })

  test("that members can be removed from a channel by the creator", async () => {
    for (const member of members.splice(0, MEMBERS_REMOVED_BY_CREATOR)) {
      const res = await client.channels[":id"].members.leave.$post({
        param: {
          id: channelId
        }
      }, {
        headers: member.headers
      })

      expect(res.status).to.equal(StatusCodes.OK)
    }
  })

  test("that the number of channel members has gone down", async () => {
    const res = await client.channels[":id"].members.$get({
      param: {
        id: channelId,
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.meta.total).to.be.equal(membersCount - MEMBERS_REMOVED_BY_CREATOR)

    membersCount = json.meta.total
  })

  test("that members can leave a channel by themselves", async () => {
    for (const member of members.splice(0, MEMBERS_LEFT_BY_THEMSELVES)) {
      const res = await client.channels[":id"].members.leave.$post({
        param: {
          id: channelId
        }
      }, {
        headers: member.headers
      })

      expect(res.status).to.equal(StatusCodes.OK)
    }
  })

  test("that the number of channel members has gone down", async () => {
    const res = await client.channels[":id"].members.$get({
      param: {
        id: channelId,
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.meta.total).to.be.equal(membersCount - MEMBERS_LEFT_BY_THEMSELVES)

    membersCount = json.meta.total
  })

  test("that a member cannot post to the channel", async () => {
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
      .map(media => media._id.toString())

    const res = await client.channels[":id"].messages.$post({
      param: {
        id: channelId
      },
      json: {
        content: ulid(),
        mediaIds
      }
    }, {
      headers: members[0].headers
    })

    expect(res.status).to.equal(StatusCodes.FORBIDDEN)
  })

  test("that a member can be promoted by the creator", async () => {
    const res = await client.channels[":id"].members[":memberId"].$patch({
      param: {
        id: channelId,
        memberId: members[0].data._id.toString()
      },
      json: {
        role: "TUTOR"
      }
    }, {
      headers: creator.headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })

  test("that a promoted member can now post to the channel", async () => {
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
      .map(media => media._id.toString())

    const res = await client.channels[":id"].messages.$post({
      param: {
        id: channelId
      },
      json: {
        content: ulid(),
        mediaIds
      }
    }, {
      headers: members[1].headers
    })

    expect(res.status).to.equal(StatusCodes.FORBIDDEN)
  })

  test("that a promoted member can be demoted by the creator", async () => {
    const res = await client.channels[":id"].members[":memberId"].$patch({
      param: {
        id: channelId,
        memberId: members[0].data._id.toString()
      },
      json: {
        role: null
      }
    }, {
      headers: creator.headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })

  test("that a demoted member cannot post to the channel", async () => {
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
      .map(media => media._id.toString())

    const res = await client.channels[":id"].messages.$post({
      param: {
        id: channelId
      },
      json: {
        content: ulid(),
        mediaIds
      }
    }, {
      headers: members[1].headers
    })

    expect(res.status).to.equal(StatusCodes.FORBIDDEN)
  })

  test("that a channel can be deleted", async () => {
    const res = await client.channels[":id"].$delete({
      param: {
        id: channelId
      }
    }, {
      headers: creator.headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })
})
