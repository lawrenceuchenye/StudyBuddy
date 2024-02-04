import { ChannelMemberRole, IChannel, IChannelMember } from "@studybuddy/backend/models/channel";
import { IUser } from "@studybuddy/backend/models/user";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { APIError } from "@studybuddy/backend/utils/error";
import PermissionsService from "@studybuddy/backend/services/permissions";
import { StatusCodes } from "http-status-codes";
import { HydratedDocument, Types } from "mongoose";
import { z } from "zod";
import { postChannelMessageSchema, updateChannelMessageSchema, updateChannelSchema } from "./schema";
import MediaRepository from "@studybuddy/backend/repositories/media";

export const getMember = async (userId: Types.ObjectId, channelId: Types.ObjectId) => {
  const channelMember = await ChannelRepository.getMember(userId, {
    channelId
  })
  if (!channelMember)
    throw new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND })
  return channelMember
}

export const getChannel = async (channelId: Types.ObjectId) => {
  const channel = await ChannelRepository.getChannel({
    id: channelId
  })
  if (!channel)
    throw new APIError("Channel not found!", { code: StatusCodes.NOT_FOUND })
  return channel
}

export const updateChannelById = async (channelId: Types.ObjectId, payload: z.infer<typeof updateChannelSchema>, user: HydratedDocument<IUser>) => {
  const channelMember = await getMember(user._id, channelId)
  const channel = await getChannel(channelId)

  if (
    PermissionsService
      .Channel({
        user: channelMember,
        channel
      })
      .cannot("update", PermissionsService.subject("Channel", channel))
  )
    throw new APIError("You do not have permission to update this channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository
    .updateChannel({
      ...payload,
      id: channelId
    })
}

export const deleteChannelById = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelMember = await getMember(user._id, channelId)
  const channel = await getChannel(channelId)

  if (
    PermissionsService
      .Channel({
        user: channelMember,
        channel
      })
      .cannot("delete", "Channel")
  )
    throw new APIError("You do not have permission to delete this channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository
    .deleteChannel({
      id: channelId
    })
}

export const joinChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelMember = await ChannelRepository.getMember(user._id, {
    channelId
  })

  if (channelMember)
    throw new APIError("You are already in this channel!", { code: StatusCodes.BAD_REQUEST })

  return ChannelRepository.addMember(user._id, {
    channelId,
  })
}

export const leaveChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const channelMember = await ChannelRepository.getMember(user._id, {
    channelId
  })

  if (!channelMember)
    throw new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST })

  return ChannelRepository.removeMember({
    channelId,
    userId: channelMember._id
  })
}

export const removeUserFromChannel = async (channelId: Types.ObjectId, channelMemberId: Types.ObjectId, remover: HydratedDocument<IUser>) => {
  const removerUser = await getMember(remover._id, channelId)
  const channel = await getChannel(channelId)
  const channelMember = await getMember(channelMemberId, channelId)

  if (
    PermissionsService
      .Channel({
        user: removerUser,
        channel
      })
      .cannot("remove", PermissionsService.subject("ChannelMember", channelMember))
  )
    throw new APIError("You do not have permission to remove this user from the channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.removeMember({
    channelId,
    userId: channelMember._id
  })
}

export const promoteChannelMember = async (channelId: Types.ObjectId, channelMemberId: Types.ObjectId, role: ChannelMemberRole, promoter: HydratedDocument<IUser>) => {
  const promoterUser = await getMember(promoter._id, channelId)
  const channelMember = await getMember(channelMemberId, channelId)
  const channel = await getChannel(channelId)

  if (
    PermissionsService
      .Channel({
        user: promoterUser,
        channel
      })
      .cannot("promote", PermissionsService.subject("ChannelMember", channelMember))
  )
    throw new APIError("You do not have permission to promote this user!", { code: StatusCodes.FORBIDDEN })

  if (promoterUser._id.equals(channelMember._id))
    throw new APIError("You cannot promote yourself!", { code: StatusCodes.BAD_REQUEST })

  return ChannelRepository.updateMember(channelMember._id, {
    role
  })
}

export const postChannelMessage = async (channelId: Types.ObjectId, payload: z.infer<typeof postChannelMessageSchema>, sender: HydratedDocument<IUser>) => {
  const channelMember = await getMember(sender._id, channelId)
  const channel = await getChannel(channelId)

  for (const mediaId of payload.mediaIds) {
    const media = await MediaRepository.getMedia(mediaId)
    if (!media)
      throw new APIError("Media not found!", { code: StatusCodes.NOT_FOUND })
  }

  if (
    PermissionsService
      .Channel({
        user: channelMember,
        channel
      })
      .cannot("post", "ChannelMessage")
  )
    throw new APIError("You do not have permission to post in this channel!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.sendMessage({
    ...payload,
    senderId: channelMember._id,
    channelId,
  })
}

export const updateChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, payload: z.infer<typeof updateChannelMessageSchema>, sender: HydratedDocument<IUser>) => {
  const channelMember = await getMember(sender._id, channelId)
  const channel = await getChannel(channelId)

  const channelMessage = await ChannelRepository.getMessage({
    channelId,
    messageId
  })

  if (!channelMessage)
    throw new APIError("Message not found in channel!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsService
      .Channel({
        user: channelMember,
        channel
      })
      .cannot("update", PermissionsService.subject("ChannelMessage", channelMessage))
  )
    throw new APIError("You do not have permission to update this message!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.updateMessageInChannel({
    ...payload,
    messageId,
    channelId,
  })
}

export const deleteChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, sender: HydratedDocument<IUser>) => {
  const channelMember = await getMember(sender._id, channelId)
  const channel = await getChannel(channelId)

  const channelMessage = await ChannelRepository.getMessage({
    channelId,
    messageId
  })

  if (!channelMessage)
    throw new APIError("Message not found in channel!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsService
      .Channel({
        user: channelMember,
        channel
      })
      .cannot("update", PermissionsService.subject("ChannelMessage", channelMessage))
  )
    throw new APIError("You do not have permission to delete this message!", { code: StatusCodes.FORBIDDEN })

  return ChannelRepository.deleteMessage({
    messageId,
    channelId
  })
}
