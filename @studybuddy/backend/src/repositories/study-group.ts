import { Types } from "mongoose"
import { StudyGroup, StudyGroupMessage, StudyGroupUser, IStudyGroup, IStudyGroupMessage, IStudyGroupUser } from "@studybuddy/backend/models/study-group"
import Pagination from "../utils/pagination"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"
import MediaRepository from "./media"

namespace StudyGroupRepository {
  export type CreateStudyGroupPayload = Omit<IStudyGroup, "createdAt">

  export async function createStudyGroup(payload: CreateStudyGroupPayload) {
    const creator = await StudyGroupUser.create({
      _id: payload.creatorId,
      studyGroupId: new Types.ObjectId(),
      role: "CREATOR",
      joinedAt: new Date(),
    })

    const studyGroup = await StudyGroup.create({
      ...payload,
      createdAt: new Date(),
    })

    creator.studyGroupId = studyGroup._id
    await creator.save()

    return studyGroup
  }

  export type GetStudyGroupPayload = {
    id: Types.ObjectId
  }

  export async function getStudyGroup(payload: GetStudyGroupPayload) {
    return StudyGroup.findById({ _id: payload.id })
  }

  export type StudyGroupQueryFilters = {
    name?: string
    subjects?: string[]
    createdBefore?: Date
    createdAfter?: Date
  }

  export async function getStudyGroups(paginationOptions: Pagination.QueryOptions, filters: StudyGroupQueryFilters = {}) {
    const query = StudyGroup.find()
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

    const studyGroups = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(studyGroups.map(sg => sg.toJSON()), { ...paginationOptions, total })
  }

  export type UpdateStudyGroupPayload = Partial<Omit<IStudyGroup, "creatorId" | "createdAt">> & {
    id: Types.ObjectId
  }

  export async function updateStudyGroup(payload: UpdateStudyGroupPayload) {
    const { id, ...updatePayload } = payload
    const { acknowledged } = await StudyGroup.updateOne({ _id: id }, updatePayload)

    if (!acknowledged)
      throw new APIError("Failed to update studyGroup", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type DeleteStudyGroupPayload = {
    id: Types.ObjectId,
  }

  export async function deleteStudyGroup(payload: DeleteStudyGroupPayload) {
    const { acknowledged } = await StudyGroup.deleteOne({ _id: payload.id })
    await StudyGroupUser.deleteMany({ studyGroupId: payload.id })

    if (!acknowledged)
      throw new APIError("Failed to delete studyGroup", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type AddMessageToStudyGroupPayload = Omit<IStudyGroupMessage, "sentAt" | "deleted"> 

  export async function sendMessage(payload: AddMessageToStudyGroupPayload) {
    const sender = await StudyGroupUser.findOne({ _id: payload.senderId, studyGroupId: payload.studyGroupId })

    if (!sender)
      throw new APIError("User doesn't exist in studyGroup", { code: StatusCodes.NOT_FOUND })

    const message = await StudyGroupMessage.create({
      ...payload,
      sentAt: new Date(),
    })

    return message
  }

  export type GetMessageInStudyGroupPayload = {
    studyGroupId: Types.ObjectId
    messageId: Types.ObjectId
  }

  export async function getMessage(payload: GetMessageInStudyGroupPayload) {
    return StudyGroupMessage.findOne({
      _id: payload.messageId,
      studyGroupId: payload.studyGroupId,
    }).exec()
  }

  export type GetMessagesPayload = {
    studyGroupId: Types.ObjectId
  }

  export type StudyGroupMessageQueryFilters = {
    contains?: string
    sentBefore?: Date
    sentAfter?: Date
  }

  export async function getMessages(payload: GetMessagesPayload, paginationOptions: Pagination.QueryOptions, filters: StudyGroupMessageQueryFilters = {}) {
    const query = StudyGroupMessage.find({
      studyGroupId: payload.studyGroupId
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

    const studyGroupMessages = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(studyGroupMessages.map(cm => cm.toJSON()), { ...paginationOptions, total })
  }

  export type UpdateMessageInStudyGroupPayload = Partial<Omit<IStudyGroupMessage, "sentAt" | "deleted" | "senderId">> & {
    messageId: Types.ObjectId
  }

  export async function updateMessageInStudyGroup(payload: UpdateMessageInStudyGroupPayload) {
    const { messageId: id, studyGroupId, ...updatePayload } = payload
    const { acknowledged } = await StudyGroupMessage.updateOne({ _id: id, studyGroupId }, updatePayload)

    if (!acknowledged)
      throw new APIError("Failed to update message in studyGroup", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type DeleteMessageInStudyGroupPayload = {
    messageId: Types.ObjectId
    studyGroupId: Types.ObjectId
  }

  export async function deleteMessage(payload: DeleteMessageInStudyGroupPayload) {
    const { messageId: id, studyGroupId } = payload
    const { acknowledged } = await StudyGroupMessage.updateOne({ _id: id, studyGroupId }, { deleted: true, content: "", mediaIds: [] })

    const message = await StudyGroupMessage.findOne({ _id: id })
    if (!message)
      throw new APIError("Message doesn't exist", { code: StatusCodes.NOT_FOUND })

    for (const mediaId of message.mediaIds) {
      await MediaRepository.deleteMedia(mediaId)
    }

    if (!acknowledged)
      throw new APIError("Failed to delete message in studyGroup", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type AddMemberPayload = Omit<IStudyGroupUser, "role" | "joinedAt">

  export async function addMember(userId: Types.ObjectId, payload: AddMemberPayload) {
    return StudyGroupUser.create({
      ...payload,
      _id: userId,
      role: null,
      joinedAt: new Date()
    })
  }

  export type GetMembersPayload = {
    id: Types.ObjectId
  }

  export type StudyGroupUserQueryFilter = {
    username?: string
    name?: string
  }

  export async function getMembers(payload: GetMembersPayload, paginationOptions: Pagination.QueryOptions, filters: StudyGroupUserQueryFilter = {}) {
    const query = StudyGroupUser.find({
      studyGroupId: payload.id
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

    const studyGroupUsers = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(studyGroupUsers.map(cu => cu.toJSON()), { ...paginationOptions, total })
  }

  export type GetMemberPayload = {
    studyGroupId: Types.ObjectId
  }

  export async function getMember(id: Types.ObjectId, payload: GetMemberPayload) {
    return StudyGroupUser.findOne({
      _id: id,
      ...payload
    }).exec()
  }

  export type UpdateMemberPayload = Omit<IStudyGroupUser, "joinedAt" | "studyGroupId" | "userId">

  export type RemoveMemberPayload = {
    userId: Types.ObjectId
    studyGroupId: Types.ObjectId
  }

  export async function removeMember(payload: RemoveMemberPayload) {
    const { userId, studyGroupId } = payload
    const { acknowledged } = await StudyGroupUser.deleteOne({ _id: userId, studyGroupId })

    if (!acknowledged)
      throw new APIError("Failed to remove user from studyGroup", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default StudyGroupRepository
