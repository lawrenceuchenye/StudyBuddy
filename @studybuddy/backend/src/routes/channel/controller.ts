import { ChannelUserRole, IChannel, IChannelUser } from "@studybuddy/backend/models/channel";
import { IUser } from "@studybuddy/backend/models/user";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { APIError } from "@studybuddy/backend/utils/error";
import PermissionsManager from "@studybuddy/backend/utils/permissions";
import { StatusCodes } from "http-status-codes";
import { HydratedDocument, Types } from "mongoose";
import { Maybe, Result } from "true-myth";
import { z } from "zod";
import { postChannelMessageSchema, updateChannelMessageSchema, updateChannelSchema } from "./schema";
import { fromMaybe } from "true-myth/result";

export const updateChannelById = async (channelId: Types.ObjectId, payload: z.infer<typeof updateChannelSchema>, user: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getUserInChannel({
    userId: user._id,
    channelId
  })

  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })

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
  const channelUser = await ChannelRepository.getUserInChannel({
    userId: user._id,
    channelId
  })

  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("delete", "Channel")
  )
    return Result.err(new APIError("You do not have permission to delete this channel!", { code: StatusCodes.FORBIDDEN }))

  return ChannelRepository
    .deleteChannel({
      id: channelId
    })
}

export const joinChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getUserInChannel({
    userId: user._id,
    channelId
  })

  if (channelUser)
    throw new APIError("You are already in this channel!", { code: StatusCodes.BAD_REQUEST })

  return ChannelRepository.addUserToChannel({
    channelId,
    userId: user._id
  })
}

export const leaveChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getUserInChannel({
    userId: user._id,
    channelId
  })

  if (!channelUser)
    throw new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST })

  return ChannelRepository.removeUserFromChannel({
    channelId,
    userId: channelUser._id
  })
}

export const removeUserFromChannel = async (channelId: Types.ObjectId, channelUserId: Types.ObjectId, remover: HydratedDocument<IUser>) => {
  const removerUser = await ChannelRepository.getUserInChannel({
    userId: remover._id,
    channelId
  })

  if (!removerUser)
    throw new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST })

  if (
    PermissionsManager
      .ChannelUser(removerUser)
      .cannot("remove", "ChannelUser")
  )
    return Result.err(new APIError("You do not have permission to remove this user from the channel!", { code: StatusCodes.FORBIDDEN }))

  const channelUser = await ChannelRepository.getUserInChannel({
    userId: channelUserId,
    channelId
  })

  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })

  return ChannelRepository.removeUserFromChannel({
    channelId,
    userId: channelUser._id
  })
}

export const promoteChannelUser = async (channelId: Types.ObjectId, channelUserId: Types.ObjectId, role: ChannelUserRole | undefined, promoter: HydratedDocument<IUser>) => {
  const promoterUser = await ChannelRepository.getUserInChannel({
    userId: promoter._id,
    channelId
  })

  if (!promoterUser)
    throw new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST })

  if (
    PermissionsManager
      .ChannelUser(promoterUser)
      .cannot("remove", "ChannelUser")
  )
    return Result.err(new APIError("You do not have permission to remove this user from the channel!", { code: StatusCodes.FORBIDDEN }))

  const channelUser = await ChannelRepository.getUserInChannel({
    userId: channelUserId,
    channelId
  })

  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsManager
      .ChannelUser(promoterUser)
      .cannot("update", "ChannelUser")
  )
    throw new APIError("You do not have permission to update this user in the channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.updateUserInChannel({
    channelId,
    userId: channelUser._id,
    role
  })
}

export const postChannelMessage = async (channelId: Types.ObjectId, payload: z.infer<typeof postChannelMessageSchema>, sender: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getUserInChannel({
    channelId,
    userId: sender._id
  })

  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("post", "ChannelMessage")
  )
    throw new APIError("You do not have permission to post in this channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.addMessageToChannel({
    ...payload,
    senderId: channelUser._id,
    channelId,
  })
}

export const updateChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, payload: z.infer<typeof updateChannelMessageSchema>, sender: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getUserInChannel({
    channelId,
    userId: sender._id
  })

  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })

  const channelMessage = await ChannelRepository.getMessageInChannel({
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
    return Result.err(new APIError("You do not have permission to update this message!", { code: StatusCodes.FORBIDDEN }))

  return ChannelRepository.updateMessageInChannel({
    ...payload,
    messageId,
    channelId,
  })
}

export const deleteChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, sender: HydratedDocument<IUser>) => {
  const channelUser = await ChannelRepository.getUserInChannel({
    channelId,
    userId: sender._id
  })

  if (!channelUser)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })

  const channelMessage = await ChannelRepository.getMessageInChannel({
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

  return ChannelRepository.deleteMessageInChannel({
    messageId,
    channelId
  })
}
