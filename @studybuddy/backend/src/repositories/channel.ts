import { HydratedDocument, Types } from "mongoose"
import { Channel, ChannelMessage, ChannelUser, IChannel, IChannelMessage, IChannelUser } from "@studybuddy/backend/models/channel"
import Pagination from "../utils/pagination"
import PermissionsManager from "../utils/permissions"
import { Result } from "true-myth"

export type CreateChannelPayload = Omit<IChannel, "createdAt">

namespace ChannelRepository {
  export async function createChannel(payload: CreateChannelPayload): Promise<Result<HydratedDocument<IChannel>, string>> {
    try {
      const creator = await ChannelUser.create({
        userId: payload.creatorId,
        channelId: new Types.ObjectId(),
        roles: ["CREATOR"],
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

  export async function getChannels(payload: GetMessagesInChannelPayload, filters: ChannelQueryFilters, paginationOptions: Pagination.QueryOptions): Promise<Result<Pagination.PaginatedResource<HydratedDocument<IChannel>>, string>> {
    try {
      const query = Channel
        .find({
          _id: payload.channelId,
          name: new RegExp(filters.name, "i"),
          subjects: {
            $all: filters.subjects ?? []
          },
          createdAt: {
            $lte: filters.createdBefore,
            $gte: filters.createdAfter
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
  id: Types.ObjectId
}

export async function deleteChannel(payload: DeleteChannelPayload): Promise<Result<undefined, string>> {
  try {
    const { acknowledged } = await Channel.deleteOne({ _id: payload.id })
    await ChannelUser.deleteMany({ channelId: payload.id })

    if (acknowledged) return Result.ok(undefined)
    return Result.err(undefined)
  }
  catch (err) {
    return Result.err(err.message)
  }
}

export type AddMessageToChannelPayload = Omit<IChannelMessage, "sentAt">

export async function addMessageToChannel(payload: AddMessageToChannelPayload): Promise<Result<HydratedDocument<IChannelMessage>, string>> {
  try {
    const sender = await ChannelUser.findOne({ _id: payload.senderId, channelId: payload.channelId })

    if (!PermissionsManager.ChannelUser(sender).can("post", "ChannelMessage")) {
      return Result.err("User doesn't have permission to send messages")
    }

    const message = await ChannelMessage.create({
      ...payload,
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

export async function getMessagesInChannel(payload: GetMessagesInChannelPayload, filters: ChannelMessageQueryFilters, paginationOptions: Pagination.QueryOptions): Promise<Result<Pagination.PaginatedResource<HydratedDocument<IChannelMessage>>, string>> {
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

export type AddUserToChannelPayload = Omit<IChannelUser, "roles" | "joinedAt">

export async function addUserToChannel(payload: AddUserToChannelPayload): Promise<Result<HydratedDocument<IChannelUser>, string>> {
  try {
    const user = await ChannelUser.create({
      ...payload,
      roles: ["MEMBER"],
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
    const roles = new Set(updatePayload.roles)
    roles.delete("CREATOR")
    roles.delete("MEMBER")
    roles.add("MEMBER")
    const { acknowledged } = await ChannelUser.updateOne({ _id: userId, channelId }, { roles })

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

export default ChannelRepository
