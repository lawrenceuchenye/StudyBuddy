import { HydratedDocument, Types } from "mongoose"
import { Channel, ChannelMedia, ChannelMessage, ChannelUser, IChannel, IChannelMessage, IChannelUser } from "@studybuddy/backend/models/channel"
import Pagination from "../utils/pagination"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"
import { IUser } from "../models/user"

namespace ChannelRepository {
  export type CreateChannelPayload = Omit<IChannel, "createdAt">

  export async function createChannel(payload: CreateChannelPayload) {
    const creator = await ChannelUser.create({
      _id: payload.creatorId,
      channelId: new Types.ObjectId(),
      role: "CREATOR",
      joinedAt: new Date(),
    })

    const channel = await Channel.create({
      ...payload,
      creatorId: creator._id,
      createdAt: new Date(),
    })

    creator.channelId = channel._id
    await creator.save()

    return channel
  }

  export type GetChannelPayload = {
    id: Types.ObjectId
  }

  export async function getChannel(payload: GetChannelPayload) {
    return Channel.findById({ _id: payload.id })
  }

  export type ChannelQueryFilters = {
    name?: string
    subjects?: string[]
    createdBefore?: Date
    createdAfter?: Date
  }

  export async function getChannels(paginationOptions: Pagination.QueryOptions, filters: ChannelQueryFilters = {}) {
    const query = Channel.find()
    if (filters.name) {
      query.merge({
        name: new RegExp(filters.name, "i"),
      })
    }

    if (filters.subjects) {
      query.merge({
        subjects: {
          $all: filters.subjects
        }
      })
    }

    if (filters.createdBefore) {
      query.merge({
        createdAt: {
          $lte: filters.createdBefore
        }
      })
    }

    if (filters.createdAfter) {
      query.merge({
        createdAt: {
          $gte: filters.createdAfter
        }
      })
    }

    const channels = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(channels.map(c => c.toJSON()), { ...paginationOptions, total })
  }

  export type UpdateChannelPayload = Partial<Omit<IChannel, "creatorId" | "createdAt">> & {
    id: Types.ObjectId
  }

  export async function updateChannel(payload: UpdateChannelPayload) {
    const { id, ...updatePayload } = payload
    const { acknowledged } = await Channel.updateOne({ _id: id }, updatePayload)

    if (!acknowledged)
      throw new APIError("Failed to update channel", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type DeleteChannelPayload = {
    id: Types.ObjectId,
  }

  export async function deleteChannel(payload: DeleteChannelPayload) {
    const { acknowledged } = await Channel.deleteOne({ _id: payload.id })
    await ChannelUser.deleteMany({ channelId: payload.id })

    if (!acknowledged)
      throw new APIError("Failed to delete channel", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type AddMessageToChannelPayload = Omit<IChannelMessage, "sentAt" | "deleted" | "mediaIds"> & {
    media: File[]
  }

  export async function sendMessage(payload: AddMessageToChannelPayload) {
    const sender = await ChannelUser.findOne({ _id: payload.senderId, channelId: payload.channelId })

    if (!sender)
      throw new APIError("User doesn't exist in channel", { code: StatusCodes.NOT_FOUND })

    const mediaIds: Types.ObjectId[] = []
    for (const medium of payload.media) {
      const data = Buffer.from(await medium.arrayBuffer()).toString("base64")

      const media = await ChannelMedia.create({
        data,
        type: medium.type,
        size: medium.size,
        uploadedAt: new Date(),
      })
      mediaIds.push(media._id)
    }

    const message = await ChannelMessage.create({
      ...payload,
      mediaIds,
      sentAt: new Date(),
    })

    return message
  }

  export type GetMessageInChannelPayload = {
    channelId: Types.ObjectId
    messageId: Types.ObjectId
  }

  export async function getMessage(payload: GetMessageInChannelPayload) {
    return ChannelMessage.findOne({
      _id: payload.messageId,
      channelId: payload.channelId,
    }).exec()
  }

  export type GetMessagesPayload = {
    channelId: Types.ObjectId
  }

  export type ChannelMessageQueryFilters = {
    contains?: string
    sentBefore?: Date
    sentAfter?: Date
  }

  export async function getMessages(payload: GetMessagesPayload, paginationOptions: Pagination.QueryOptions, filters: ChannelMessageQueryFilters = {}) {
    const query = ChannelMessage.find({
      channelId: payload.channelId
    })

    if (filters.contains) {
      query.merge({
        contains: new RegExp(filters.contains, "i"),
      })
    }

    if (filters.sentBefore) {
      query.merge({
        createdAt: {
          $lte: filters.sentBefore
        }
      })
    }

    if (filters.sentAfter) {
      query.merge({
        createdAt: {
          $gte: filters.sentAfter
        }
      })
    }

    const channelMessages = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(channelMessages.map(cm => cm.toJSON()), { ...paginationOptions, total })
  }

  export type UpdateMessageInChannelPayload = Partial<Omit<IChannelMessage, "sentAt" | "deleted" | "senderId">> & {
    messageId: Types.ObjectId
  }

  export async function updateMessageInChannel(payload: UpdateMessageInChannelPayload) {
    const { messageId: id, channelId, ...updatePayload } = payload
    const { acknowledged } = await ChannelMessage.updateOne({ _id: id, channelId }, updatePayload)

    if (!acknowledged)
      throw new APIError("Failed to update message in channel", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type DeleteMessageInChannelPayload = {
    messageId: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function deleteMessage(payload: DeleteMessageInChannelPayload) {
    const { messageId: id, channelId } = payload
    const { acknowledged } = await ChannelMessage.updateOne({ _id: id, channelId }, { deleted: true, content: "", mediaIds: [] })
    if (!acknowledged)
      throw new APIError("Failed to delete message in channel", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type AddMemberPayload = Omit<IChannelUser, "role" | "joinedAt">

  export async function addMember(userId: Types.ObjectId, payload: AddMemberPayload) {
    return ChannelUser.create({
      ...payload,
      _id: userId,
      role: null,
      joinedAt: new Date()
    })
  }

  export type GetMembersPayload = {
    id: Types.ObjectId
  }

  export type ChannelUserQueryFilter = {
    username?: string
    name?: string
  }

  export async function getMembers(payload: GetMembersPayload, paginationOptions: Pagination.QueryOptions, filters: ChannelUserQueryFilter = {}) {
    const query = ChannelUser.find({
      channelId: payload.id
    })

    // TODO: test this out to ensure this query actually works
    if (filters.name || filters.username) {
      const orQuery = []
      if (filters.name) {
        orQuery.push({
          name: new RegExp(filters.name, "i")
        })
      }
      if (filters.username) {
        orQuery.push({
          username: new RegExp(filters.username, "i")
        })
      }
      query.merge({
        $or: orQuery
      })
    }

    const channelUsers = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(channelUsers.map(cu => cu.toJSON()), { ...paginationOptions, total })
  }

  export type GetMemberPayload = {
    channelId: Types.ObjectId
  }

  export async function getMember(id: Types.ObjectId, payload: GetMemberPayload) {
    return ChannelUser.findOne({
      _id: id,
      ...payload
    }).exec()
  }

  export type UpdateMemberPayload = Omit<IChannelUser, "joinedAt" | "channelId" | "userId">

  export async function updateMember(id: Types.ObjectId, payload: UpdateMemberPayload) {
    if (payload.role === "CREATOR")
      throw new APIError("Cannot promote user to creator", { code: StatusCodes.INTERNAL_SERVER_ERROR })

    const { acknowledged } = await ChannelUser.updateOne({ _id: id }, payload)

    if (!acknowledged)
      throw new APIError("Failed to update user in channel", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type RemoveMemberPayload = {
    userId: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function removeMember(payload: RemoveMemberPayload) {
    const { userId, channelId } = payload
    const { acknowledged } = await ChannelUser.deleteOne({ _id: userId, channelId })

    if (!acknowledged)
      throw new APIError("Failed to remove user from channel", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default ChannelRepository
