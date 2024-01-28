import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { Types } from "mongoose";
import { describe, test, expect } from "vitest";
import Database from "@studybuddy/backend/utils/database";
import { ulid } from "ulidx";
import { File } from '@web-std/file'
import { Maybe } from "true-myth";

describe("Channels unit test", async () => {
  await Database.start()

  const userId = new Types.ObjectId()
  const user2Id = new Types.ObjectId()

  let creatorId: Types.ObjectId
  let memberId: Types.ObjectId
  let channelId: Types.ObjectId

  const channelPayload = {
    name: ulid(),
    subjects: [ulid(), ulid(), ulid()],
    description: ulid()
  }

  const newChannel = {
    name: ulid(),
    subjects: [ulid(), ulid(), ulid()],
    description: ulid()
  }

  let channelsCount: number

  test("that channels can be retrieved", async () => {
    const channels = await ChannelRepository.getChannels({
      page: 1,
      perPage: 10
    })

    channelsCount = channels.meta.total
  })

  test("that a channel can be created", async () => {
    const channel = await ChannelRepository.createChannel({
      ...channelPayload,
      creatorId: userId,
    })

    expect(channel.name).to.equal(channel.name)
    expect(channel.description).to.equal(channel.description)
    expect(channel.subjects).to.deep.equal(channel.subjects)

    channelId = channel._id
    creatorId = channel.creatorId
  })

  test("that the count of channels has increased", async () => {
    const channels = await ChannelRepository.getChannels({
      page: 1,
      perPage: 10
    })

    expect(channels.meta.total).to.equal(channelsCount + 1)
  })

  test("that only channels with a matching subject can be retrieved", async () => {
    const channels = await ChannelRepository.getChannels({ page: 1, perPage: 10 }, { subjects: channelPayload.subjects.slice(0, 1) })

    expect(channels.data).to.have.lengthOf(1)
    expect(channels.meta.total).to.equal(1)
  })

  test("that only channels with a matching name can be retrieved", async () => {
    const channels = await ChannelRepository.getChannels({ page: 1, perPage: 10 }, { name: channelPayload.name })

    expect(channels.data).to.have.lengthOf(1)
    expect(channels.meta.total).to.equal(1)
  })

  test("that a channel can be updated", async () => {
    await ChannelRepository.updateChannel({
      ...newChannel,
      id: channelId
    })

    const channel = await ChannelRepository.getChannel({
      id: channelId
    })

    if (!channel)
      throw new Error("Channel not found!")

    expect(channel.name).to.equal(newChannel.name)
    expect(channel.description).to.equal(newChannel.description)
    expect(channel.subjects).to.deep.equal(newChannel.subjects)
  })

  test("that members of a channel can be fetched", async () => {
    const channelUsers = await ChannelRepository.getMembers({
      id: channelId,
    }, { page: 1, perPage: 10 })

    expect(channelUsers.data).to.have.lengthOf(1)
    expect(channelUsers.meta.total).to.equal(1)
  })

  test("that a user can be added to a channel", async () => {
    const channelUser = await ChannelRepository.addUserToChannel({
      channelId,
      userId: user2Id,
    })

    memberId = channelUser._id
  })

  test("that number of channel members has increased", async () => {
    const channelUsers = await ChannelRepository.getMembers({
      id: channelId,
    }, { page: 1, perPage: 10 })

    expect(channelUsers.data).to.have.lengthOf(2)
    expect(channelUsers.meta.total).to.equal(2)
  })

  test("that a user cannot send a message to the channel", async () => {
    expect(
      async () => ChannelRepository.sendMessage({
        senderId: memberId,
        channelId,
        content: ulid(),
        media: [
          new File(["content"], ulid(), { type: "text/plain" })
        ]
      })
    )
      .rejects.toThrow()
  })

  test("that a user can be promoted to tutor", async () => {
    await ChannelRepository.updateMember({
      channelId,
      userId: memberId,
      role: "TUTOR"
    })
  })

  test("that a user can now send a message to the channel", async () => {
    await ChannelRepository.sendMessage({
      senderId: memberId,
      channelId,
      content: ulid(),
      media: [
        new File(["content"], ulid(), { type: "text/plain" })
      ]
    })
  })

  test("that a user can be removed from a channel", async () => {
    await ChannelRepository.removeMember({
      channelId,
      userId: memberId,
    })
  })

  test("that number of channel members has decreased", async () => {
    const channelUsers = await ChannelRepository.getMembers({
      id: channelId
    }, { page: 1, perPage: 10 })

    expect(channelUsers.data).to.have.lengthOf(1)
    expect(channelUsers.meta.total).to.equal(1)
  })

  test("that a channel can be deleted", async () => {
    await ChannelRepository.deleteChannel({
      id: channelId,
    })

    const channel = await ChannelRepository.getChannel({
      id: channelId
    })

    expect(channel).to.be.null
  })
})
