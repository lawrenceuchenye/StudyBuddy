import { StudyGroupUserRole, IStudyGroup, IStudyGroupUser } from "@studybuddy/backend/models/study-group";
import { IUser } from "@studybuddy/backend/models/user";
import StudyGroupRepository from "@studybuddy/backend/repositories/study-group";
import { APIError } from "@studybuddy/backend/utils/error";
import PermissionsManager from "@studybuddy/backend/utils/permissions";
import { StatusCodes } from "http-status-codes";
import { HydratedDocument, Types } from "mongoose";
import { z } from "zod";
import { postStudyGroupMessageSchema, updateStudyGroupMessageSchema, updateStudyGroupSchema } from "./schema";
import UserRepository from "@studybuddy/backend/repositories/user";

export const getMember = async (userId: Types.ObjectId, studyGroupId: Types.ObjectId) => {
  const studyGroupUser = await StudyGroupRepository.getMember(userId, {
    studyGroupId
  })
  if (!studyGroupUser)
    throw new APIError("User not found in studyGroup!", { code: StatusCodes.NOT_FOUND })
  return studyGroupUser
}

export const getStudyGroup = async (studyGroupId: Types.ObjectId) => {
  const studyGroup = await StudyGroupRepository.getStudyGroup({
    id: studyGroupId
  })
  if (!studyGroup)
    throw new APIError("Study group not found!", { code: StatusCodes.NOT_FOUND })
  return studyGroup
}

export const updateStudyGroupById = async (studyGroupId: Types.ObjectId, payload: z.infer<typeof updateStudyGroupSchema>, user: HydratedDocument<IUser>) => {
  const studyGroupUser = await getMember(user._id, studyGroupId)
  const studyGroup = await getStudyGroup(studyGroupId)

  if (
    PermissionsManager
      .StudyGroup({
        user: studyGroupUser,
        studyGroup
      })
      .cannot("update", PermissionsManager.subject("StudyGroup", studyGroup))
  )
    throw new APIError("You do not have permission to update this study group!", { code: StatusCodes.FORBIDDEN })

  return StudyGroupRepository
    .updateStudyGroup({
      ...payload,
      id: studyGroupId
    })
}

export const deleteStudyGroupById = async (studyGroupId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const studyGroupUser = await getMember(user._id, studyGroupId)
  const studyGroup = await getStudyGroup(studyGroupId)

  if (
    PermissionsManager
      .StudyGroup({
        user: studyGroupUser,
        studyGroup
      })
      .cannot("delete", "StudyGroup")
  )
    throw new APIError("You do not have permission to delete this study group!", { code: StatusCodes.FORBIDDEN })

  return StudyGroupRepository
    .deleteStudyGroup({
      id: studyGroupId
    })
}

export const addUserToStudyGroup = async (studyGroupId: Types.ObjectId, userId: Types.ObjectId, creator: HydratedDocument<IUser>) => {
  const creatorGroupProfile = await getMember(studyGroupId, creator._id)
  const studyGroup = await getStudyGroup(studyGroupId)

  const studyGroupUser = await StudyGroupRepository.getMember(userId, {
    studyGroupId
  })

  if (studyGroupUser)
    throw new APIError("You are already in this study group!", { code: StatusCodes.BAD_REQUEST })

  if (
    PermissionsManager
      .StudyGroup({
        user: creatorGroupProfile,
        studyGroup
      })
      .cannot("add", "StudyGroupUser")
  )
    throw new APIError("You do not have permission to add this user to this channel", { code: StatusCodes.FORBIDDEN })

  return StudyGroupRepository.addMember(userId, {
    studyGroupId,
  })
}

export const leaveStudyGroup = async (studyGroupId: Types.ObjectId, user: HydratedDocument<IUser>) => {
  const studyGroupUser = await StudyGroupRepository.getMember(user._id, {
    studyGroupId
  })

  if (!studyGroupUser)
    throw new APIError("You are not in this study group!", { code: StatusCodes.BAD_REQUEST })

  return StudyGroupRepository.removeMember({
    studyGroupId,
    userId: studyGroupUser._id
  })
}

export const removeUserFromStudyGroup = async (studyGroupId: Types.ObjectId, studyGroupUserId: Types.ObjectId, remover: HydratedDocument<IUser>) => {
  const removerUser = await getMember(remover._id, studyGroupId)
  const studyGroup = await getStudyGroup(studyGroupId)
  const studyGroupUser = await getMember(studyGroupUserId, studyGroupId)

  if (
    PermissionsManager
      .StudyGroup({
        user: removerUser,
        studyGroup
      })
      .cannot("remove", PermissionsManager.subject("StudyGroupUser", studyGroupUser))
  )
    throw new APIError("You do not have permission to remove this user from the study group!", { code: StatusCodes.FORBIDDEN })

  return StudyGroupRepository.removeMember({
    studyGroupId,
    userId: studyGroupUser._id
  })
}

export const postStudyGroupMessage = async (studyGroupId: Types.ObjectId, payload: z.infer<typeof postStudyGroupMessageSchema>, sender: HydratedDocument<IUser>) => {
  const studyGroupUser = await getMember(sender._id, studyGroupId)
  const studyGroup = await getStudyGroup(studyGroupId)

  if (
    PermissionsManager
      .StudyGroup({
        user: studyGroupUser,
        studyGroup
      })
      .cannot("post", "StudyGroupMessage")
  )
    throw new APIError("You do not have permission to post in this study group!", { code: StatusCodes.FORBIDDEN })

  return StudyGroupRepository.sendMessage({
    ...payload,
    senderId: studyGroupUser._id,
    studyGroupId,
  })
}

export const updateStudyGroupMessage = async (studyGroupId: Types.ObjectId, messageId: Types.ObjectId, payload: z.infer<typeof updateStudyGroupMessageSchema>, sender: HydratedDocument<IUser>) => {
  const studyGroupUser = await getMember(sender._id, studyGroupId)
  const studyGroup = await getStudyGroup(studyGroupId)

  const studyGroupMessage = await StudyGroupRepository.getMessage({
    studyGroupId,
    messageId
  })

  if (!studyGroupMessage)
    throw new APIError("Message not found in studyGroup!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsManager
      .StudyGroup({
        user: studyGroupUser,
        studyGroup
      })
      .cannot("update", PermissionsManager.subject("StudyGroupMessage", studyGroupMessage))
  )
    throw new APIError("You do not have permission to update this message!", { code: StatusCodes.FORBIDDEN })

  return StudyGroupRepository.updateMessageInStudyGroup({
    ...payload,
    messageId,
    studyGroupId,
  })
}

export const deleteStudyGroupMessage = async (studyGroupId: Types.ObjectId, messageId: Types.ObjectId, sender: HydratedDocument<IUser>) => {
  const studyGroupUser = await getMember(sender._id, studyGroupId)
  const studyGroup = await getStudyGroup(studyGroupId)

  const studyGroupMessage = await StudyGroupRepository.getMessage({
    studyGroupId,
    messageId
  })

  if (!studyGroupMessage)
    throw new APIError("Message not found in studyGroup!", { code: StatusCodes.NOT_FOUND })

  if (
    PermissionsManager
      .StudyGroup({
        user: studyGroupUser,
        studyGroup
      })
      .cannot("update", PermissionsManager.subject("StudyGroupMessage", studyGroupMessage))
  )
    throw new APIError("You do not have permission to delete this message!", { code: StatusCodes.FORBIDDEN })

  return StudyGroupRepository.deleteMessage({
    messageId,
    studyGroupId
  })
}
