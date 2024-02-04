import { Types } from "mongoose"
import { Resource, IResource } from "@studybuddy/backend/models/resource"
import Pagination from "../utils/pagination"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"

namespace ResourceRepository {
  export type CreateResourcePayload = Omit<IResource, "createdAt">

  export async function createResource(payload: CreateResourcePayload) {
    return await Resource.create({
      ...payload,
      createdAt: new Date(),
    })
  }

  export type GetResourcePayload = {
    id: Types.ObjectId
  }

  export async function getResource(payload: GetResourcePayload) {
    return Resource.findById({ _id: payload.id })
  }

  export type ResourceQueryFilters = {
    title?: string
    subjects?: string[]
    shortDescription?: string
    longDescription?: string
    createdBefore?: Date
    createdAfter?: Date
  }

  export async function getResources(paginationOptions: Pagination.QueryOptions, filters: ResourceQueryFilters = {}) {
    const query = Resource.find()
    if (filters.title) {
      query.merge({
        title: new RegExp(filters.title, "i"),
      })
    }

    if (filters.shortDescription) {
      query.merge({
        shortDescription: new RegExp(filters.shortDescription, "i"),
      })
    }

    if (filters.longDescription) {
      query.merge({
        longDescription: new RegExp(filters.longDescription, "i"),
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

    const resources = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()
    return Pagination.createPaginatedResource(resources.map(c => c.toJSON()), { ...paginationOptions, total })
  }

  export type UpdateResourcePayload = Partial<Omit<IResource, "creatorId" | "createdAt">> & {
    id: Types.ObjectId
  }

  export async function updateResource(payload: UpdateResourcePayload) {
    const { id, ...updatePayload } = payload
    const { acknowledged } = await Resource.updateOne({ _id: id }, updatePayload)

    if (!acknowledged)
      throw new APIError("Failed to update resource", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export type DeleteResourcePayload = {
    id: Types.ObjectId,
  }

  export async function deleteResource(payload: DeleteResourcePayload) {
    const { acknowledged } = await Resource.deleteOne({ _id: payload.id })

    if (!acknowledged)
      throw new APIError("Failed to delete resource", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default ResourceRepository
