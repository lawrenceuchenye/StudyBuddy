import { HydratedDocument, Query, Types } from "mongoose"
import { Channel, ChannelMedia, ChannelMessage, ChannelUser, IChannel, IChannelMessage, IChannelUser } from "@studybuddy/backend/models/channel"
import Pagination from "../utils/pagination"
import PermissionsManager from "../utils/permissions"
import { Result, Maybe } from "true-myth"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"
import GlobalLogger from "../utils/logger"

namespace ChannelRepository {
  const logger = GlobalLogger.getSubLogger({ name: "ChannelRepository" })

  export type CreateChannelPayload = Omit<IChannel, "createdAt">

  export async function createChannel(payload: CreateChannelPayload): Promise<Result<HydratedDocument<IChannel>, APIError>> {
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
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type GetChannelPayload = {
    id: Types.ObjectId
  }

  export async function getChannel(payload: GetChannelPayload): Promise<Result<Maybe<HydratedDocument<IChannel>>, APIError>> {
    try {
      const channel = await Channel.findById({ _id: payload.id })
      return Result.ok(Maybe.of(channel))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type ChannelQueryFilters = {
    name?: string
    subjects?: string[]
    createdBefore?: Date
    createdAfter?: Date
  }

  export async function getChannels(paginationOptions: Pagination.QueryOptions, filters: ChannelQueryFilters = {}): Promise<Result<Pagination.PaginatedResource<HydratedDocument<IChannel>>, APIError>> {
    try {
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
      return Result.ok(Pagination.createPaginatedResource(channels, { ...paginationOptions, total }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type UpdateChannelPayload = Partial<Omit<IChannel, "creatorId" | "createdAt">> & {
    id: Types.ObjectId
  }

  export async function updateChannel(payload: UpdateChannelPayload): Promise<Result<undefined, APIError>> {
    try {
      const { id, ...updatePayload } = payload
      const { acknowledged } = await Channel.updateOne({ _id: id }, updatePayload)

      if (acknowledged) return Result.ok(undefined)
      return Result.err(new APIError("Failed to update channel", { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type DeleteChannelPayload = {
    id: Types.ObjectId,
  }

  export async function deleteChannel(payload: DeleteChannelPayload): Promise<Result<undefined, APIError>> {
    try {
      const { acknowledged } = await Channel.deleteOne({ _id: payload.id })
      await ChannelUser.deleteMany({ channelId: payload.id })

      if (acknowledged) return Result.ok(undefined)
      return Result.err(new APIError("Failed to delete channel", { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type AddMessageToChannelPayload = Omit<IChannelMessage, "sentAt" | "deleted" | "mediaIds"> & {
    media: File[]
  }

  export async function addMessageToChannel(payload: AddMessageToChannelPayload): Promise<Result<HydratedDocument<IChannelMessage>, APIError>> {
    try {
      const sender = await ChannelUser.findOne({ _id: payload.senderId, channelId: payload.channelId })

      if (!sender)
        return Result.err(new APIError("User doesn't exist in channel", { code: StatusCodes.NOT_FOUND }))

      if (!PermissionsManager.ChannelUser(sender).can("post", "ChannelMessage")) {
        return Result.err(new APIError("User doesn't have permission to send messages", { code: StatusCodes.UNAUTHORIZED }))
      }

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

      return Result.ok(message)
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type GetMessagesInChannelPayload = {
    id: Types.ObjectId
  }

  export type ChannelMessageQueryFilters = {
    contains?: string
    sentBefore?: Date
    sentAfter?: Date
  }

  export async function getMessagesInChannel(payload: GetMessagesInChannelPayload, paginationOptions: Pagination.QueryOptions, filters: ChannelMessageQueryFilters = {}): Promise<Result<Pagination.PaginatedResource<HydratedDocument<IChannelMessage>>, APIError>> {
    try {
      const query = ChannelMessage.find({
        _id: payload.id
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
      return Result.ok(Pagination.createPaginatedResource(channelMessages, { ...paginationOptions, total }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type UpdateMessageInChannelPayload = Partial<Omit<IChannelMessage, "sentAt" | "deleted" | "senderId">> & {
    id: Types.ObjectId
  }

  export async function updateMessageInChannel(payload: UpdateMessageInChannelPayload): Promise<Result<undefined, APIError>> {
    try {
      const { id, channelId, ...updatePayload } = payload
      const { acknowledged } = await ChannelMessage.updateOne({ _id: id, channelId }, updatePayload)

      if (acknowledged) return Result.ok(undefined)
      return Result.err(new APIError("Failed to update message in channel", { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type DeleteMessageInChannelPayload = {
    id: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function deleteMessageInChannel(payload: DeleteMessageInChannelPayload): Promise<Result<undefined, APIError>> {
    try {
      const { id, channelId } = payload
      const { acknowledged } = await ChannelMessage.updateOne({ _id: id, channelId }, { deleted: true, content: "", mediaIds: [] })
      if (acknowledged) return Result.ok(undefined)
      return Result.err(new APIError("Failed to delete message in channel", { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type AddUserToChannelPayload = Omit<IChannelUser, "role" | "joinedAt">

  export async function addUserToChannel(payload: AddUserToChannelPayload): Promise<Result<HydratedDocument<IChannelUser>, APIError>> {
    try {
      const user = await ChannelUser.create({
        ...payload,
        role: "MEMBER",
        joinedAt: new Date()
      })
      return Result.ok(user)
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type GetUsersInChannelPayload = {
    id: Types.ObjectId
  }

  export type ChannelUserQueryFilter = {
    username?: string
    name?: string
  }

  export async function getUsersInChannel(payload: GetUsersInChannelPayload, paginationOptions: Pagination.QueryOptions, filters: ChannelUserQueryFilter = {}): Promise<Result<Pagination.PaginatedResource<HydratedDocument<IChannelUser>>, APIError>> {
    try {
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
      return Result.ok(Pagination.createPaginatedResource(channelUsers, { ...paginationOptions, total }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type GetUserInChannelPayload = {
    channelId: Types.ObjectId
    userId: Types.ObjectId
  }

  export async function getUserInChannel(payload: GetUserInChannelPayload): Promise<Result<Maybe<HydratedDocument<IChannelUser>>, APIError>> {
    try {
      const channelUser = await ChannelUser.findOne({
        _id: payload.userId,
        channelId: payload.channelId,
      }).exec()

      return Result.ok(Maybe.of(channelUser))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type UpdateUserInChannelPayload = Omit<IChannelUser, "joinedAt">

  export async function updateUserInChannel(payload: UpdateUserInChannelPayload): Promise<Result<undefined, APIError>> {
    try {
      const { userId, channelId, ...updatePayload } = payload

      if (updatePayload.role === "CREATOR")
        return Result.err(new APIError("Cannot promote user to creator", { code: StatusCodes.INTERNAL_SERVER_ERROR }))

      const { acknowledged } = await ChannelUser.updateOne({ _id: userId, channelId }, updatePayload)

      if (acknowledged) return Result.ok(undefined)
      return Result.err(new APIError("Failed to update user in channel", { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }

  export type RemoveUserFromChannelPayload = {
    userId: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function removeUserFromChannel(payload: RemoveUserFromChannelPayload): Promise<Result<undefined, APIError>> {
    try {
      const { userId, channelId } = payload
      const { acknowledged } = await ChannelUser.deleteOne({ _id: userId, channelId })

      if (acknowledged) return Result.ok(undefined)
      return Result.err(new APIError("Failed to remove user from channel", { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    catch (err) {
      logger.error(err)
      return Result.err(new APIError((err as Error).message, { code: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
  }
}

export default ChannelRepository
