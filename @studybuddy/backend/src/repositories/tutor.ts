import { Types } from "mongoose"
import { ITutor, Tutor } from "../models/tutor"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"
import Pagination from "../utils/pagination"

namespace TutorRepository {
  type CreateTutorPayload = Omit<ITutor, "joinedAt"> & { _id: Types.ObjectId }

  export const createTutor = async (payload: CreateTutorPayload) => {
    return Tutor.create({
      ...payload,
      joinedAt: new Date()
    })
  }

  export const getTutor = async (id: Types.ObjectId) => {
    return Tutor.findById(id)
  }

  type GetTutorsFilters = Partial<Omit<ITutor, "joinedAt" | "trustFundId" | "userId">> | undefined

  export const getTutors = async (paginationOptions: Pagination.QueryOptions, filters: GetTutorsFilters) => {
    const query = Tutor.find()
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

  type UpdateTutorPayload = Partial<Omit<ITutor, "joinedAt" | "userId">>

  export const updateTutor = async (id: Types.ObjectId, payload: UpdateTutorPayload) => {
    return Tutor.updateOne({ _id: id }, payload)
  }

  export const deleteTutor = async (id: Types.ObjectId) => {
    const { acknowledged } = await Tutor.deleteOne({ _id: id })
    if (!acknowledged)
      throw new APIError("Failed to delete tutor", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default TutorRepository
