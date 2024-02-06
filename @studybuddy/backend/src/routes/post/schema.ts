import Pagination from "@studybuddy/backend/utils/pagination"
import { transformMongoId } from "@studybuddy/backend/utils/validator"
import { z } from "zod"

export const createPostSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  content: z.string()
})

export const getPostById = z.object({
  id: z.string().transform(transformMongoId)
})

export const getPosts = Pagination
  .schema
  .merge(z.object({
    title: z.string(),
    tags: z.array(z.string()),
    content: z.string(),
    authorId: z.string().transform(transformMongoId),
    isPublished: z.string().pipe(z.boolean()),
    createdBefore: z.string().pipe(z.date()),
    createdAfter: z.string().pipe(z.date()),
    publishedBefore: z.string().pipe(z.date()),
    publishedAfter: z.string().pipe(z.date()),
  })
    .partial())

export const publishPost = z.object({
  id: z.string().transform(transformMongoId)
})

export const unPublishPost = publishPost

export const updatePostBody = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  content: z.string(),
})
  .partial()

export const updatePostParam = z.object({
  id: z.string().transform(transformMongoId)
})

export const deletePost = z.object({
  id: z.string().transform(transformMongoId)
})
