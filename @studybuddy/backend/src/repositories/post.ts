import { Types } from "mongoose"
import { IPost, Post } from "../models/post"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"
import Pagination from "../utils/pagination"

namespace PostRepository {
  type CreatePostPayload = Omit<IPost, "publishedAt" | "isPublished" | "createdAt" | "updatedAt">

  export const createPost = async (payload: CreatePostPayload) => {
    return Post.create({
      ...payload,
      isPublished: false,
      createdAt: new Date()
    })
  }

  export const getPost = async (id: Types.ObjectId) => {
    return Post.findById(id)
  }

  type GetPostsFilters = Partial<Omit<IPost, "joinedAt" | "trustFundId" | "userId">> | undefined

  export const getPosts = async (paginationOptions: Pagination.QueryOptions, filters: GetPostsFilters) => {
    const query = Post.find()
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

  type UpdatePostPayload = Partial<Omit<IPost, "joinedAt" | "userId">>

  export const updatePost = async (id: Types.ObjectId, payload: UpdatePostPayload) => {
    return Post.updateOne({ _id: id }, payload)
  }

  export const deletePost = async (id: Types.ObjectId) => {
    const { acknowledged } = await Post.deleteOne({ _id: id })
    if (!acknowledged)
      throw new APIError("Failed to delete tutor", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default PostRepository
