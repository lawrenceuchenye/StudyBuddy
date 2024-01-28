import { ChannelUserRole, IChannel, IChannelUser } from "@studybuddy/backend/models/channel";
import { IUser } from "@studybuddy/backend/models/user";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { APIError } from "@studybuddy/backend/utils/error";
import PermissionsManager from "@studybuddy/backend/utils/permissions";
import { StatusCodes } from "http-status-codes";
import { HydratedDocument, Types } from "mongoose";
import { z } from "zod";
import { postChannelMessageSchema, updateChannelMessageSchema, updateChannelSchema } from "./schema";

export const getMember = async (userId: Types.ObjectId, channelId: Types.ObjectId) => {
  const channelUser = await ChannelRepository.getMember(userId, {
    channelId
  })
  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })
  return channelUser
}

export const updateChannelById = async (channelId: Types.ObjectId, payload: z.infer<typeof updateChannelSchema>, user: HydratedDocument<IUser>) => {
  const channelUser = await getMember(user._id, channelId)

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("update", "Channel")
  )
    throw new APIError("You do not have permission to update this channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository
    .updateChannel({
      ...payload,
      id: channelId
    })
}

export const deleteChannelById = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelUser = await getMember(user._id, channelId)

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("delete", "Channel")
  )
    throw new APIError("You do not have permission to delete this channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository
    .deleteChannel({
      id: channelId
    })
}

export const joinChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getMember(user._id, {
    channelId
  })

  if (channelUser)
    throw new APIError("You are already in this channel!", { code: StatusCodes.BAD_REQUEST })

  return ChannelRepository.addMember(user, {
    channelId,
  })
}

export const leaveChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getMember(user._id, {
    channelId
  })

  if (!channelUser)
    throw new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST })

  return ChannelRepository.removeMember({
    channelId,
    userId: channelUser._id
  })
}

export const removeUserFromChannel = async (channelId: Types.ObjectId, channelUserId: Types.ObjectId, remover: HydratedDocument<IUser>) => {
  const removerUser = await getMember(remover._id, channelId)

  if (
    PermissionsManager
      .ChannelUser(removerUser)
      .cannot("remove", "ChannelUser")
  )
    throw new APIError("You do not have permission to remove this user from the channel!", { code: StatusCodes.FORBIDDEN })

  const channelUser = await getMember(channelUserId, channelId)

  return ChannelRepository.removeMember({
    channelId,
    userId: channelUser._id
  })
}

export const promoteChannelUser = async (channelId: Types.ObjectId, channelUserId: Types.ObjectId, role: ChannelUserRole | undefined, promoter: HydratedDocument<IUser>) => {
  const promoterUser = await getMember(promoter._id, channelId)

  if (
    PermissionsManager
      .ChannelUser(promoterUser)
      .cannot("remove", "ChannelUser")
  )
    throw new APIError("You do not have permission to remove this user from the channel!", { code: StatusCodes.FORBIDDEN })

  const channelUser = await getMember(channelUserId, channelId)

  if (
    PermissionsManager
      .ChannelUser(promoterUser)
      .cannot("update", "ChannelUser")
  )
    throw new APIError("You do not have permission to update this user in the channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.updateMember(channelUser._id, {
    role
  })
}

export const postChannelMessage = async (channelId: Types.ObjectId, payload: z.infer<typeof postChannelMessageSchema>, sender: HydratedDocument<IUser>) => {
  const channelUser = await getMember(sender._id, channelId)

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("post", "ChannelMessage")
  )
    throw new APIError("You do not have permission to post in this channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.sendMessage({
    ...payload,
    senderId: channelUser._id,
    channelId,
  })
}

export const updateChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, payload: z.infer<typeof updateChannelMessageSchema>, sender: HydratedDocument<IUser>) => {
  const channelUser = await getMember(sender._id, channelId)

  const channelMessage = await ChannelRepository.getMessage({
    channelId,
    messageId
  })

  if (!channelMessage)
    throw new APIError("Message not found in channel!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("update", PermissionsManager.subject("ChannelMessage", channelMessage))
  )
    throw new APIError("You do not have permission to update this message!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.updateMessageInChannel({
    ...payload,
    messageId,
    channelId,
  })
}

export const deleteChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, sender: HydratedDocument<IUser>) => {
  const channelUser = await getMember(sender._id, channelId)

  const channelMessage = await ChannelRepository.getMessage({
    channelId,
    messageId
  })

  if (!channelMessage)
    throw new APIError("Message not found in channel!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("update", PermissionsManager.subject("ChannelMessage", channelMessage))
  )
    throw new APIError("You do not have permission to delete this message!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.deleteMessage({
    messageId,
    channelId
  })
}
