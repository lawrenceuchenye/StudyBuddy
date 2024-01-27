import { afterAll, describe, expect, test } from "vitest";
import UserSeeder from "../seeders/user";
import { client } from "../setup";
import ChannelSeeder from "../seeders/channel";
import Token from "@studybuddy/backend/utils/token";

describe("Channels integration test", async () => {
  const user = await UserSeeder.generate()
  const token = await Token.generateAccessToken(user)
  const channelPayload = ChannelSeeder.seed()

  afterAll(async () => user.destroy())

  test("that a channel can be created", async () => {
    const res = await client.channels.$post({
      json: channelPayload,
    }, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(res.status).toBe(201)
  })

  test("that a channel can be retrieved", async () => {
    const res = await client.channels.$get()

    const json = await res.json()

    expect(res.status).toBe(200)
    // expect(json.data).toBeInstanceOf(Array)
  })
})