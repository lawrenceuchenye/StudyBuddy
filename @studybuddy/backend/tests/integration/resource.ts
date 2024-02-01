import { afterAll, describe, expect, test } from "vitest";
import UserSeeder from "../seeders/user";
import { client } from "../setup";
import ResourceSeeder from "../seeders/resource";
import Token from "@studybuddy/backend/utils/token";
import { StatusCodes } from "http-status-codes";
import Database from "@studybuddy/backend/utils/database";

describe("Resources integration test", async () => {
  await Database.start()

  const [creator, user] = await Promise.all(
    Array(2)
      .fill(null)
      .map(async () => {
        const user = await UserSeeder.generate()
        const token = await Token.generateAccessToken(user)

        return {
          data: user,
          token,
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      })
  )

  const resourcePayload = {
    old: ResourceSeeder.seed(),
    new: ResourceSeeder.seed()
  }
  let resourceId: string

  afterAll(async () => {
    await user.data.destroy()
    await creator.data.destroy()
  })

  test("that a resource can be created", async () => {
    const url = client.resources[":id"].$url()

    const formData = new FormData()

    formData.append("title", resourcePayload.old.title)
    formData.append("shortDescription", resourcePayload.old.shortDescription)
    formData.append("longDescription", resourcePayload.old.longDescription)
    for (const subject of resourcePayload.old.subjects) {
      formData.append("subjects[]", subject)
    }
    for (const medium of resourcePayload.old.media) {
      formData.append("media[]", medium)
    }

    const res = await fetch(url, {
      method: "POST",
      headers: creator.headers,
      body: formData
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.CREATED)
    resourceId = json.data._id
  })

  test("that a resource can be retrieved", async () => {
    const res = await client.resources.$get()

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.data).to.be.instanceOf(Array)
  })

  test("that a resource cannot be updated by a random user", async () => {
    const url = client.resources[":id"].$url()

    const formData = new FormData()

    formData.append("title", resourcePayload.new.title)
    formData.append("shortDescription", resourcePayload.new.shortDescription)
    formData.append("longDescription", resourcePayload.new.longDescription)
    for (const subject of resourcePayload.new.subjects) {
      formData.append("subjects[]", subject)
    }
    for (const medium of resourcePayload.new.media) {
      formData.append("media[]", medium)
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: user.headers,
      body: formData
    })

    expect(res.status).to.equal(StatusCodes.FORBIDDEN)
  })

  test("that a resource can be updated by the creator", async () => {
    const url = client.resources[":id"].$url()

    const formData = new FormData()

    formData.append("title", resourcePayload.new.title)
    formData.append("shortDescription", resourcePayload.new.shortDescription)
    formData.append("longDescription", resourcePayload.new.longDescription)
    for (const subject of resourcePayload.new.subjects) {
      formData.append("subjects[]", subject)
    }
    for (const medium of resourcePayload.new.media) {
      formData.append("media[]", medium)
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: creator.headers,
      body: formData
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })

  test("that the resource has been updated", async () => {
    const res = await client.resources[":id"].$get({
      param: {
        id: resourceId
      }
    })

    const json = await res.json()

    expect(res.status).to.equal(StatusCodes.OK)
    expect(json.data.title).to.equal(resourcePayload.new.title)
  })

  test("that a resource can be deleted", async () => {
    const res = await client.resources[":id"].$delete({
      param: {
        id: resourceId
      }
    }, {
      headers: creator.headers
    })

    expect(res.status).to.equal(StatusCodes.OK)
  })
})
