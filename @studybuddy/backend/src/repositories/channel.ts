import { Types } from "mongoose"
import { Channel, ChannelMessage, ChannelUser } from "@studybuddy/backend/models/channel"

export type CreateChannelPayload = {
  creatorId: Types.ObjectId
  name: string
}
async function createChannel(payload: CreateChannelPayload) {
  const creator = await ChannelUser.create({
    userId: payload.creatorId,
    roles: ["CREATOR"],
    joinedAt: new Date(),
  })

  const channel = await Channel.create({
    ...payload,
    creatorId: creator._id,
    createdAt: new Date(),
  })

  return channel
}

type CreateChannelMessage = {
  content: string
  mediaIds: Types.ObjectId[]
  channelId: Types.ObjectId
  senderId: Types.ObjectId
}

async function createChannelMessage(payload: CreateChannelMessage) {
  const message = await ChannelMessage.create({
    ...payload,
    sentAt: new Date(),
  })

  return message
}

const ChannelRepository = {
  createChannel,
  createChannelMessage,
}

export default ChannelRepository
