import { Types } from "mongoose"
import { Channel, ChannelMessage, ChannelUser, IChannel, IChannelMessage, IChannelUser } from "@studybuddy/backend/models/channel"
import { PaginationQueryOptions, createPaginatedResource } from "../utils/pagination"
import PermissionsManager from "../utils/permissions"

export type CreateChannelPayload = Omit<IChannel, "createdAt">

namespace ChannelRepository {
  export async function createChannel(payload: CreateChannelPayload) {
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

    return channel
  }

  export type GetChannelPayload = {
    id: Types.ObjectId
  }

  export async function getChannel(payload: GetChannelPayload) {
    const channel = await Channel.findOne({ _id: payload.id })
    return channel
  }

  export type ChannelQueryFilters = {
    name?: string
    subjects?: string[]
    createdBefore?: Date
    createdAfter?: Date
  }

  export async function getChannels(payload: GetMessagesInChannelPayload, filters: ChannelQueryFilters, paginationOptions: PaginationQueryOptions) {
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
    return createPaginatedResource(channelMessages, { ...paginationOptions, total })
  }

  export type UpdateChannelPayload = Omit<IChannel, "creatorId" | "createdAt"> & {
    id: Types.ObjectId
  }

  export async function updateChannel(payload: UpdateChannelPayload) {
    const { id, ...updatePayload } = payload
    const { acknowledged } = await Channel.updateOne({ _id: id }, updatePayload)
    return acknowledged
  }

  export type DeleteChannelPayload = {
    id: Types.ObjectId
  }

  export async function deleteChannel(payload: DeleteChannelPayload) {
    const { acknowledged } = await Channel.deleteOne({ _id: payload.id })
    return acknowledged
  }

  export type AddMessageToChannelPayload = Omit<IChannelMessage, "sentAt">

  export async function addMessageToChannel(payload: AddMessageToChannelPayload) {
    const sender = await ChannelUser.findOne({ _id: payload.senderId, channelId: payload.channelId })

    if (!PermissionsManager.ChannelUser(sender).can("post", "ChannelMessage")) {
      return false
    }

    const message = await ChannelMessage.create({
      ...payload,
      sentAt: new Date(),
    })

    return message
  }

  export type GetMessagesInChannelPayload = {
    channelId: Types.ObjectId
  }

  export type ChannelMessageQueryFilters = {
    contains?: string
    before?: Date
    after?: Date
  }

  export async function getMessagesInChannel(payload: GetMessagesInChannelPayload, filters: ChannelMessageQueryFilters, paginationOptions: PaginationQueryOptions) {
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
    return createPaginatedResource(channelMessages, { ...paginationOptions, total })
  }

  export type UpdateMessageInChannelPayload = Omit<IChannelMessage, "sentAt" | "channelId" | "senderId"> & {
    id: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function updateMessageInChannel(payload: UpdateMessageInChannelPayload) {
    const { id, channelId, ...updatePayload } = payload
    const { acknowledged } = await ChannelMessage.updateOne({ _id: id, channelId }, updatePayload)
    return acknowledged
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

  export async function addUserToChannel(payload: AddUserToChannelPayload) {
    const user = await ChannelUser.create({
      ...payload,
      roles: ["MEMBER"],
      joinedAt: new Date()
    })
    return user
  }

  export type UpdateUserInChannelPayload = Omit<IChannelUser, "joinedAt">

  export async function updateUserInChannel(payload: UpdateUserInChannelPayload) {
    const { userId, channelId, ...updatePayload } = payload
    const roles = new Set(updatePayload.roles)
    roles.delete("CREATOR")
    roles.delete("MEMBER")
    roles.add("MEMBER")
    const { acknowledged } = await ChannelUser.updateOne({ _id: userId, channelId }, { roles })
    return acknowledged
  }

  export type RemoveUserFromChannelPayload = {
    userId: Types.ObjectId
    channelId: Types.ObjectId
  }

  export async function removeUserFromChannel(payload: RemoveUserFromChannelPayload) {
    const { userId, channelId } = payload
    await ChannelUser.deleteOne({ _id: userId, channelId })
  }
}

export default ChannelRepository
