import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { Types } from "mongoose";
import { describe, test, expect } from "vitest";
import Database from "@studybuddy/backend/utils/database";
import { ulid } from "ulidx";
import { File } from '@web-std/file'
import UserRepository from "@studybuddy/backend/repositories/user";
import UserSeeder from "../seeders/user";
import MediaRepository from "@studybuddy/backend/repositories/media";

describe("Channels unit test", async () => {
  await Database.start()

  const userId = new Types.ObjectId()
  const user2 = await UserSeeder.generate()

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
    channelsCount = channels.meta.total
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
    const channelMembers = await ChannelRepository.getMembers({
      id: channelId,
    }, { page: 1, perPage: 10 })

    expect(channelMembers.data).to.have.lengthOf(1)
    expect(channelMembers.meta.total).to.equal(1)
  })

  test("that a user can be added to a channel", async () => {
    const channelMember = await ChannelRepository.addMember(user2._id, {
      channelId,
    })

    memberId = channelMember._id
  })

  test("that number of channel members has increased", async () => {
    const channelMembers = await ChannelRepository.getMembers({
      id: channelId,
    }, { page: 1, perPage: 10 })

    expect(channelMembers.data).to.have.lengthOf(2)
    expect(channelMembers.meta.total).to.equal(2)
  })

  test("that a user can be promoted to tutor", async () => {
    await ChannelRepository.updateMember(memberId, {
      role: "TUTOR"
    })
  })

  test("that a user can now send a message to the channel", async () => {
    const mediaIds = [
      await MediaRepository
        .createMedia(
          new File(["content"], ulid(), { type: "text/plain" })
        )
    ]
    .map(media => media._id)

    await ChannelRepository.sendMessage({
      senderId: memberId,
      channelId,
      content: ulid(),
      mediaIds
    })
  })

  test("that a user can be removed from a channel", async () => {
    await ChannelRepository.removeMember({
      channelId,
      userId: memberId,
    })
  })

  test("that number of channel members has decreased", async () => {
    const channelMembers = await ChannelRepository.getMembers({
      id: channelId
    }, { page: 1, perPage: 10 })

    expect(channelMembers.data).to.have.lengthOf(1)
    expect(channelMembers.meta.total).to.equal(1)
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

  test("that the count of channels has decreased", async () => {
    const channels = await ChannelRepository.getChannels({
      page: 1,
      perPage: 10
    })

    expect(channels.meta.total).to.equal(channelsCount - 1)
    channelsCount = channels.meta.total
  })
})
