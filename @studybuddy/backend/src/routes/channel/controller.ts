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

export const fetchChannelUser = async (channelId: Types.ObjectId, userId: Types.ObjectId): Promise<Result<Maybe<HydratedDocument<IChannelUser>>, APIError>> => {
  const channelUserFetchResult = await ChannelRepository.getUserInChannel({
    userId,
    channelId
  })

  if (channelUserFetchResult.isErr)
    return Result.err(new APIError(channelUserFetchResult.error.message, { code: channelUserFetchResult.error.code }))
  const maybeChannelUser = channelUserFetchResult.value

  return Result.ok(maybeChannelUser)
}

export const updateChannelById = async (channelId: Types.ObjectId, payload: z.infer<typeof updateChannelSchema>, user: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const channelUserResult = await fetchChannelUser(channelId, user._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult
  const channelUser = channelUserResult.value

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("update", "Channel")
  )
    return Result.err(new APIError("You do not have permission to update this channel!", { code: StatusCodes.FORBIDDEN }))

  return ChannelRepository
    .updateChannel({
      ...payload,
      id: channelId
    })
}

export const deleteChannelById = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const channelUserResult = await fetchChannelUser(channelId, user._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult
  const channelUser = channelUserResult.value

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

export const joinChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const channelUserResult = await fetchChannelUser(channelId, user._id)
    .then<Result<undefined, APIError>>(result => result
      .andThen(maybeChannelUser => {
        if (maybeChannelUser.isJust)
          return Result.err(new APIError("You are already in this channel!", { code: StatusCodes.BAD_REQUEST }))
        return Result.ok(undefined)
      }))

  if (channelUserResult.isErr)
    return channelUserResult

  return ChannelRepository.addUserToChannel({
    channelId,
    userId: user._id
  })
}

export const leaveChannel = async (channelId: Types.ObjectId, user: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const channelUserResult = await fetchChannelUser(channelId, user._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult
  const channelUser = channelUserResult.value

  return ChannelRepository.removeUserFromChannel({
    channelId,
    userId: channelUser._id
  })
}

export const removeUserFromChannel = async (channelId: Types.ObjectId, channelUserId: Types.ObjectId, remover: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const removerUserResult = await fetchChannelUser(channelId, remover._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => {
        if (maybeChannelUser.isNothing)
          return Result.err(new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST }))

        if (
          PermissionsManager
            .ChannelUser(maybeChannelUser.value)
            .cannot("remove", "ChannelUser")
        )
          return Result.err(new APIError("You do not have permission to remove this user from the channel!", { code: StatusCodes.FORBIDDEN }))

        return Result.ok(maybeChannelUser.value)
      }))

  if (removerUserResult.isErr)
    return removerUserResult

  const channelUserResult = await fetchChannelUser(channelId, channelUserId)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult

  const channelUser = removerUserResult.value

  return ChannelRepository.removeUserFromChannel({
    channelId,
    userId: channelUser._id
  })
}

export const promoteChannelUser = async (channelId: Types.ObjectId, channelUserId: Types.ObjectId, role: ChannelUserRole | undefined, promoter: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const promoterUserResult = await fetchChannelUser(channelId, promoter._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => {
        if (maybeChannelUser.isNothing)
          return Result.err(new APIError("You are not in this channel!", { code: StatusCodes.BAD_REQUEST }))

        if (
          PermissionsManager
            .ChannelUser(maybeChannelUser.value)
            .cannot("remove", "ChannelUser")
        )
          return Result.err(new APIError("You do not have permission to update this user in the channel!", { code: StatusCodes.FORBIDDEN }))

        return Result.ok(maybeChannelUser.value)
      }))

  if (promoterUserResult.isErr)
    return promoterUserResult

  const channelUserResult = await fetchChannelUser(channelId, channelUserId)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult
  const channelUser = channelUserResult.value

  return ChannelRepository.updateUserInChannel({
    channelId,
    userId: channelUser._id,
    role
  })
}

export const postChannelMessage = async (channelId: Types.ObjectId, payload: z.infer<typeof postChannelMessageSchema>, sender: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const channelUserResult = await fetchChannelUser(channelId, sender._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult
  const channelUser = channelUserResult.value

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("post", "ChannelMessage")
  )
    return Result.err(new APIError("You do not have permission to post in this channel!", { code: StatusCodes.FORBIDDEN }))

  return ChannelRepository.addMessageToChannel({
    ...payload,
    senderId: channelUser._id,
    channelId,
  })
}

export const updateChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, payload: z.infer<typeof updateChannelMessageSchema>, sender: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const channelUserResult = await fetchChannelUser(channelId, sender._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult
  const channelUser = channelUserResult.value

  const channelMessageFetchResult = await ChannelRepository.getMessageInChannel({
    channelId,
    messageId
  })

  if (channelMessageFetchResult.isErr)
    return channelMessageFetchResult
  const channelMessage = channelMessageFetchResult.value

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

export const deleteChannelMessage = async (channelId: Types.ObjectId, messageId: Types.ObjectId, sender: HydratedDocument<IUser>): Promise<Result<unknown, APIError>> => {
  const channelUserResult = await fetchChannelUser(channelId, sender._id)
    .then<Result<HydratedDocument<IChannelUser>, APIError>>(result => result
      .andThen(maybeChannelUser => fromMaybe(
        new APIError("User not found in channel!", { code: StatusCodes.NOT_FOUND }),
        maybeChannelUser
      )))

  if (channelUserResult.isErr)
    return channelUserResult
  const channelUser = channelUserResult.value

  const channelMessageFetchResult = await ChannelRepository.getMessageInChannel({
    channelId,
    messageId
  })

  if (channelMessageFetchResult.isErr)
    return channelMessageFetchResult
  const channelMessage = channelMessageFetchResult.value

  if (
    PermissionsManager
      .ChannelUser(channelUser)
      .cannot("update", PermissionsManager.subject("ChannelMessage", channelMessage))
  )
    return Result.err(new APIError("You do not have permission to delete this message!", { code: StatusCodes.FORBIDDEN }))

  return ChannelRepository.deleteMessageInChannel({
    messageId,
    channelId
  })
}
