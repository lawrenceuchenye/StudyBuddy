import { afterAll, describe, expect, test } from "vitest";
import UserSeeder from "../seeders/user";
import { client } from "../setup";
import ChannelSeeder from "../seeders/channel";
import Token from "@studybuddy/backend/utils/token";
import { StatusCodes } from "http-status-codes";

describe("Channels integration test", async () => {
  const [creator, ...members] = await Promise.all(Array(2)
    .fill(null)
    .map(async (_) => {
      const member = await UserSeeder.generate()
      const token = await Token.generateAccessToken(member)

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
      const res = await client.channels[":id"].join.$post({
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

  // test("that a channel cannot be updated by a random user", async () => {
  //   const res = await client.channels[":id"].$patch({
  //     param: {
  //       id: channelId
  //     },
  //     json: channelPayload.new
  //   }, {
  //     headers: members[0].headers
  //   })
  //
  //   // because the user is not in the channel
  //   expect(res.status).to.equal(StatusCodes.NOT_FOUND)
  // })

  test("that users can be gotten from the channel", async () => {
    for (const member of members) {
      const res = await client.channels[":channelId"].members[":memberId"].$get({
        param: {
          channelId,
          memberId: member.data._id.toString()
        }
      })

      const json = await res.json()

      console.log(json)

      expect(res.status).to.equal(StatusCodes.OK)
      expect(json.data).to.be.instanceOf(Object)
    }
  })

  test("that the number of channel members has gone up", async () => {
    const res = await client.channels[":id"].members.$get({
      param: {
        id: channelId,
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.meta.total).to.be.greaterThan(membersCount)
  })

  test("that a channel can be deleted", async () => {
    const res = await client.channels[":id"].$delete({
      param: {
        id: channelId
      }
    }, {
      headers: creatorHeaders
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })
})
