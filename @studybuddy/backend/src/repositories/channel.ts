import { HydratedDocument, Query, Types } from "mongoose"
import { Channel, ChannelMedia, ChannelMessage, ChannelUser, IChannel, IChannelMessage, IChannelUser } from "@studybuddy/backend/models/channel"
import Pagination from "../utils/pagination"
import PermissionsManager from "../utils/permissions"
import { Result } from "true-myth"

namespace ChannelRepository {
  export type CreateChannelPayload = Omit<IChannel, "createdAt">

  export async function createChannel(payload: CreateChannelPayload): Promise<Result<HydratedDocument<IChannel>, string>> {
    try {
      const creator = await ChannelUser.create({
        userId: payload.creatorId,
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

      return Result.ok(channel)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type GetChannelPayload = {
    id: Types.ObjectId
  }

  export async function getChannel(payload: GetChannelPayload): Promise<Result<HydratedDocument<IChannel>, string>> {
    try {
      const channel = await Channel.findById({ _id: payload.id })
      return Result.ok(channel)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type ChannelQueryFilters = {
    name?: string
    subjects?: string[]
    createdBefore?: Date
    createdAfter?: Date
  }

  export async function getChannels(paginationOptions: Pagination.QueryOptions, filters?: ChannelQueryFilters = {}): Promise<Result<Pagination.PaginatedResource<HydratedDocument<IChannel>>, string>> {
    try {
      let query = Channel.find()
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

      const channelMessages = await query
        .clone()
        .exec()

      const total = await query.countDocuments()
      return Result.ok(Pagination.createPaginatedResource(channelMessages, { ...paginationOptions, total }))
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type UpdateChannelPayload = Omit<IChannel, "creatorId" | "createdAt"> & {
    id: Types.ObjectId
  }

  export async function updateChannel(payload: UpdateChannelPayload): Promise<Result<undefined, string>> {
    try {
      const { id, ...updatePayload } = payload
      const { acknowledged } = await Channel.updateOne({ _id: id }, updatePayload)

      if (acknowledged) return Result.ok(undefined)
      return Result.err(undefined)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type DeleteChannelPayload = {
    channelId: Types.ObjectId,
  }

  export async function deleteChannel(payload: DeleteChannelPayload): Promise<Result<undefined, string>> {
    try {
      const user = await ChannelUser.findOne({ _id: payload.userId })
      const channel = await Channel.findOne({ _id: payload.channelId })

      const { acknowledged } = await Channel.deleteOne({ _id: payload.channelId })
      await ChannelUser.deleteMany({ channelId: payload.channelId })

      if (acknowledged) return Result.ok(undefined)
      return Result.err(undefined)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type AddMessageToChannelPayload = Omit<IChannelMessage, "sentAt" | "deleted" | "mediaIds"> & {
    media: File[]
  }

  export async function addMessageToChannel(payload: AddMessageToChannelPayload): Promise<Result<HydratedDocument<IChannelMessage>, string>> {
    try {
      const sender = await ChannelUser.findOne({ _id: payload.senderId, channelId: payload.channelId })

      console.log(sender)
      if (!PermissionsManager.ChannelUser(sender).can("post", "ChannelMessage")) {
        return Result.err("User doesn't have permission to send messages")
      }

      const mediaIds: Types.ObjectId[] = []
      for (const medium of payload.media) {
        const data = new Buffer([await medium.arrayBuffer()]).toString("base64")
        
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

      return Result.ok(message)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type GetMessagesInChannelPayload = {
    channelId: Types.ObjectId
  }

  export type ChannelMessageQueryFilters = {
    contains?: string
    before?: Date
    after?: Date
  }

  export async function getMessagesInChannel(payload: GetMessagesInChannelPayload, paginationOptions: Pagination.QueryOptions, filters: ChannelMessageQueryFilters): Promise<Result<Pagination.PaginatedResource<HydratedDocument<IChannelMessage>>, string>> {
    try {
      const query = ChannelMessage
        .find({
          _id: payload.channelId,
          content: new RegExp(filters.contains, "i"),
          sentAt: {
            $lte: filters.before,
            $gte: filters.after
          },
        })
        .skip(paginationOptions.perPage * paginationOptions.page - 1)
        .limit(paginationOptions.perPage)

      const channelMessages = await query
        .exec()

      const total = await query.countDocuments()
      return Result.ok(Pagination.createPaginatedResource(channelMessages, { ...paginationOptions, total }))
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type UpdateMessageInChannelPayload = Omit<IChannelMessage, "sentAt" | "channelId" | "senderId"> & {
    id: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function updateMessageInChannel(payload: UpdateMessageInChannelPayload): Promise<Result<undefined, string>> {
    try {
      const { id, channelId, ...updatePayload } = payload
      const { acknowledged } = await ChannelMessage.updateOne({ _id: id, channelId }, updatePayload)

      if (acknowledged) return Result.ok(undefined)
      return Result.err(undefined)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type DeleteMessageInChannelPayload = {
    id: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function deleteMessageInChannel(payload: DeleteMessageInChannelPayload) {
    const { id, channelId } = payload
    const { acknowledged } = await ChannelMessage.updateOne({ _id: id, channelId }, { deleted: true, content: "", mediaIds: [] })
    return acknowledged
  }

  export type AddUserToChannelPayload = Omit<IChannelUser, "role" | "joinedAt">

  export async function addUserToChannel(payload: AddUserToChannelPayload): Promise<Result<HydratedDocument<IChannelUser>, string>> {
    try {
      const user = await ChannelUser.create({
        ...payload,
        role: "MEMBER",
        joinedAt: new Date()
      })
      return Result.ok(user)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type UpdateUserInChannelPayload = Omit<IChannelUser, "joinedAt">

  export async function updateUserInChannel(payload: UpdateUserInChannelPayload): Promise<Result<undefined, string>> {
    try {
      const { userId, channelId, ...updatePayload } = payload

      if (updatePayload.role === "CREATOR")
        return Result.err("Cannot promote user to creator")

      const { acknowledged } = await ChannelUser.updateOne({ _id: userId, channelId }, updatePayload)

      if (acknowledged) return Result.ok(undefined)
      return Result.err(undefined)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }

  export type RemoveUserFromChannelPayload = {
    userId: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function removeUserFromChannel(payload: RemoveUserFromChannelPayload): Promise<Result<undefined, string>> {
    try {
      const { userId, channelId } = payload
      const { acknowledged } = await ChannelUser.deleteOne({ _id: userId, channelId })

      if (acknowledged) return Result.ok(undefined)
      return Result.err(undefined)
    }
    catch (err) {
      return Result.err(err.message)
    }
  }
}

export default ChannelRepository
