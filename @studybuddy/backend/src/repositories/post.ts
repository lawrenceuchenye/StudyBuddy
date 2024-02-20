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

  type GetPostsFilters = Partial<Omit<IPost, "joinedAt" | "trustFundId" | "userId" | "createdAt" | "updatedAt" | "publishedAt">> & Partial<{
    createdBefore: Date
    createdAfter: Date
    publishedBefore: Date
    publishedAfter: Date
  }> | undefined

  export const getPosts = async (paginationOptions: Pagination.QueryOptions, filters: GetPostsFilters) => {
    const query = Post.find()

    if (filters) {
      if (filters.title)
        query.merge({
          name: {
            $regex: filters.title,
            $options: "i"
          }
        })

      if (filters.tags)
        query.merge({
          tags: {
            $in: filters.tags
          }
        })

      if (filters.content)
        query.merge({
          content: {
            $regex: filters.content,
            $options: "i"
          }
        })

      if (filters.isPublished !== undefined)
        query.merge({
          isPublished: filters.isPublished
        })

      if (filters.authorId)
        query.merge({
          authorId: filters.authorId
        })

      if (filters.createdBefore)
        query.merge({
          createdAt: {
            $lte: filters.createdBefore
          }
        })

      if (filters.createdAfter)
        query.merge({
          createdAt: {
            $gte: filters.createdAfter
          }
        })

      if (filters.publishedBefore)
        query.merge({
          publishedAt: {
            $lte: filters.publishedBefore
          }
        })

      if (filters.publishedAfter)
        query.merge({
          publishedAt: {
            $gte: filters.publishedAfter
          }
        })
    }

    const posts = await query
      .clone()
      .limit(paginationOptions.perPage)
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .exec()

    const total = await query.countDocuments()

    return Pagination.createPaginatedResource(posts.map(p => p.toJSON()), { ...paginationOptions, total })
  }

  type UpdatePostPayload = Partial<Omit<IPost, "createdAt" | "updatedAt">>

  export const updatePost = async (id: Types.ObjectId, payload: UpdatePostPayload) => {
    const { acknowledged } = await Post.updateOne({ _id: id }, {
      ...payload,
      updatedAt: new Date()
    })

    if (!acknowledged)
      throw new APIError("Failed to update post!", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export const deletePost = async (id: Types.ObjectId) => {
    const { acknowledged } = await Post.deleteOne({ _id: id })
    if (!acknowledged)
      throw new APIError("Failed to delete post!", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default PostRepository
