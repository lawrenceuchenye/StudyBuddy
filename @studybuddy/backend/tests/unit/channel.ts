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

  const channel = {
    name: ulid(),
    subjects: [ulid(), ulid(), ulid()],
    description: ulid()
  }

  const newChannel = {
    name: ulid(),
    subjects: [ulid(), ulid(), ulid()],
    description: ulid()
  }

  test("that a channel can be created", async () => {
    const channelCreationResult = await ChannelRepository.createChannel({
      ...channel,
      creatorId: userId,
    })

    expect(channelCreationResult.isOk).to.be.true

    channelCreationResult.map(channel => {
      expect(channel.name).to.equal(channel.name)
      expect(channel.description).to.equal(channel.description)
      expect(channel.subjects).to.deep.equal(channel.subjects)

      channelId = channel._id
      creatorId = channel.creatorId
    })
  })

  test("that a channel can be retrieved", async () => {
    const channelRetrievalResult = await ChannelRepository.getChannel({
      id: channelId
    })

    expect(channelRetrievalResult.isOk).to.be.true
  })

  test("that channels can be retrieved", async () => {
    const channelsRetrievalResult = await ChannelRepository.getChannels({ page: 1, perPage: 10 })

    expect(channelsRetrievalResult.isOk).to.be.true
  })

  test("that only channels with a matching subject can be retrieved", async () => {
    const channelsRetrievalResult = await ChannelRepository.getChannels({ page: 1, perPage: 10 }, { subjects: channel.subjects.slice(0, 1) })

    expect(channelsRetrievalResult.isOk).to.be.true

    channelsRetrievalResult.map(channels => {
      expect(channels.data).to.have.lengthOf(1)
      expect(channels.meta.total).to.equal(1)
    })
  })

  test("that only channels with a matching name can be retrieved", async () => {
    const channelsRetrievalResult = await ChannelRepository.getChannels({ page: 1, perPage: 10 }, { name: channel.name })

    expect(channelsRetrievalResult.isOk).to.be.true

    channelsRetrievalResult.map(channels => {
      expect(channels.data).to.have.lengthOf(1)
      expect(channels.meta.total).to.equal(1)
    })
  })

  test("that a channel can be updated", async () => {
    const channelUpdateResult = await ChannelRepository.updateChannel({
      ...newChannel,
      id: channelId
    })

    expect(channelUpdateResult.isOk).to.be.true

    const channelRetrievalResult = await ChannelRepository.getChannel({
      id: channelId
    })

    expect(channelRetrievalResult.isOk).to.be.true

    channelRetrievalResult.map(maybeChannel => {
      expect(maybeChannel.isJust).to.be.true

      maybeChannel.andThen(channel => {
        expect(channel.name).to.equal(newChannel.name)
        expect(channel.description).to.equal(newChannel.description)
        expect(channel.subjects).to.deep.equal(newChannel.subjects)

        return Maybe.nothing()
      })
    })
  })

  test("that members of a channel can be fetched", async () => {
    const channelUsersResult = await ChannelRepository.getUsersInChannel({
      id: channelId,
    }, { page: 1, perPage: 10 })

    expect(channelUsersResult.isOk).to.be.true
    channelUsersResult.map(channelUsers => {
      expect(channelUsers.data).to.have.lengthOf(1)
      expect(channelUsers.meta.total).to.equal(1)
    })
  })

  test("that a user can be added to a channel", async () => {
    const channelUserAdditionResult = await ChannelRepository.addUserToChannel({
      channelId,
      userId: user2Id,
    })

    expect(channelUserAdditionResult.isOk).to.be.true
    channelUserAdditionResult.map(channelUser => {
      memberId = channelUser._id
    })
  })

  test("that number of channel members has increased", async () => {
    const channelUsersResult = await ChannelRepository.getUsersInChannel({
      id: channelId,
    }, { page: 1, perPage: 10 })

    expect(channelUsersResult.isOk).to.be.true
    channelUsersResult.map(channelUsers => {
      expect(channelUsers.data).to.have.lengthOf(2)
      expect(channelUsers.meta.total).to.equal(2)
    })
  })

  test("that a user cannot send a message to the channel", async () => {
    const channelMessageCreationResult = await ChannelRepository.addMessageToChannel({
      senderId: memberId,
      channelId,
      content: ulid(),
      media: [
        new File(["content"], ulid(), { type: "text/plain" })
      ]
    })

    expect(channelMessageCreationResult.isErr).to.be.true
  })

  test("that a user can be promoted to tutor", async () => {
    const channelUserPromotionResult = await ChannelRepository.updateUserInChannel({
      channelId,
      userId: memberId,
      role: "TUTOR"
    })

    expect(channelUserPromotionResult.isOk).to.be.true
  })

  test("that a user can now send a message to the channel", async () => {
    const channelMessageCreationResult = await ChannelRepository.addMessageToChannel({
      senderId: memberId,
      channelId,
      content: ulid(),
      media: [
        new File(["content"], ulid(), { type: "text/plain" })
      ]
    })

    expect(channelMessageCreationResult.isOk).to.be.true
  })

  test("that a user can be removed from a channel", async () => {
    const channelUserRemovalResult = await ChannelRepository.removeUserFromChannel({
      channelId,
      userId: memberId,
    })

    expect(channelUserRemovalResult.isOk).to.be.true
  })

  test("that number of channel members has decreased", async () => {
    const channelUsersResult = await ChannelRepository.getUsersInChannel({
      id: channelId
    }, { page: 1, perPage: 10 })

    expect(channelUsersResult.isOk).to.be.true
    channelUsersResult.map(channelUsers => {
      expect(channelUsers.data).to.have.lengthOf(1)
      expect(channelUsers.meta.total).to.equal(1)
    })
  })

  test("that a channel can be deleted", async () => {
    const channelDeletionResult = await ChannelRepository.deleteChannel({
      id: channelId,
    })

    expect(channelDeletionResult.isOk).to.be.true

    const channelRetrievalResult = await ChannelRepository.getChannel({
      id: channelId
    })

    expect(channelRetrievalResult.isOk).to.be.true

    channelRetrievalResult.map(maybeChannel => {
      expect(maybeChannel.isNothing).to.be.true
    })
  })
})
