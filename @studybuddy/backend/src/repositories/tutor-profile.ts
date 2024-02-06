import { Types } from "mongoose"
import { ITutorProfile, TutorProfile } from "../models/tutor"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"
import Pagination from "../utils/pagination"

namespace TutorProfileRepository {
  type CreateTutorProfilePayload = Omit<ITutorProfile, "joinedAt"> & { _id: Types.ObjectId }

  export const createTutorProfile = async (payload: CreateTutorProfilePayload) => {
    return TutorProfile.create({
      ...payload,
      joinedAt: new Date()
    })
  }

  export const getTutorProfile = async (id: Types.ObjectId) => {
    return TutorProfile.findById(id)
  }

  type GetTutorProfilesFilters = Partial<Omit<ITutorProfile, "joinedAt" | "trustFundId" | "userId">> | undefined

  export const getTutorProfiles = async (paginationOptions: Pagination.QueryOptions, filters: GetTutorProfilesFilters) => {
    const query = TutorProfile.find()
    if (filters) {
      if (filters.name)
        query.merge({
          name: {
            $regex: filters.name,
            $options: "i"
          }
        })
    }

    const tutors = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(tutors.map(t => t.toJSON()), { ...paginationOptions, total })
  }

  type UpdateTutorProfilePayload = Partial<Omit<ITutorProfile, "joinedAt" | "userId">>

  export const updateTutorProfile = async (id: Types.ObjectId, payload: UpdateTutorProfilePayload) => {
    return TutorProfile.updateOne({ _id: id }, payload)
  }

  export const deleteTutorProfile = async (id: Types.ObjectId) => {
    const { acknowledged } = await TutorProfile.deleteOne({ _id: id })
    if (!acknowledged)
      throw new APIError("Failed to delete tutor", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default TutorProfileRepository
