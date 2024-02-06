import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { Hono } from "hono";
import { createPostSchema, deletePost, getPostById, getPosts, publishPost, unPublishPost, updatePostBody, updatePostParam } from "./schema";
import { zValidator } from "@hono/zod-validator";
import PostRepository from "@studybuddy/backend/repositories/post";
import Pagination from "@studybuddy/backend/utils/pagination";
import { StatusCodes } from "http-status-codes";
import { APIError } from "@studybuddy/backend/utils/error";
import { Types } from "mongoose";
import PermissionsService from "@studybuddy/backend/services/permissions";

export const getPost = async (id: Types.ObjectId) => PostRepository
  .getPost(id)
  .then((post) => {
    if (!post)
      throw new APIError("Post not found!", { code: StatusCodes.NOT_FOUND })
    return post
  })

export default new Hono()
  .post("/",
    JwtMiddleware.verify,
    zValidator("json", createPostSchema),
    async (c) => {
      const user = c.var.user
      const payload = c.req.valid("json")

      const post = await PostRepository.createPost({
        ...payload,
        authorId: user._id
      })

      return c.json(Pagination.createSingleResource({ id: post._id.toString() }), StatusCodes.CREATED)
    })
  .get("/:id",
    zValidator("param", getPostById),
    async (c) => {
      const { id } = c.req.valid("param")

      const post = getPost(id)

      return c.json(Pagination.createSingleResource(post))
    })
  .get("/",
    zValidator("query", getPosts),
    async (c) => {
      const { page, perPage, ...filters } = c.req.valid("query")

      const posts = await PostRepository.getPosts({ page, perPage }, filters)

      return c.json(posts)
    })
  .post("/:id/publish",
    JwtMiddleware.verify,
    zValidator("param", publishPost),
    async (c) => {
      const { id } = c.req.valid("param")
      const user = c.var.user

      const post = await getPost(id)

      if (
        PermissionsService
          .Post({
            user,
            post
          })
          .cannot("update", "Post")
      )
        throw new APIError("You do not have permission to publish this post!", { code: StatusCodes.FORBIDDEN })

      await PostRepository.updatePost(id, {
        isPublished: true,
        publishedAt: new Date()
      })

      return c.json({ message: "Post published successfully!" })
    })
  .post("/:id/unpublish",
    JwtMiddleware.verify,
    zValidator("param", unPublishPost),
    async (c) => {
      const { id } = c.req.valid("param")
      const user = c.var.user

      const post = await getPost(id)

      if (
        PermissionsService
          .Post({
            user,
            post
          })
          .cannot("update", "Post")
      )
        throw new APIError("You do not have permission to publish this post!", { code: StatusCodes.FORBIDDEN })

      await PostRepository.updatePost(id, {
        isPublished: false,
        publishedAt: null
      })

      return c.json({ message: "Post published successfully!" })
    })
  .patch("/:id",
    JwtMiddleware.verify,
    zValidator("json", updatePostBody),
    zValidator("param", updatePostParam),
    async (c) => {
      const user = c.var.user
      const { id } = c.req.valid("param")
      const payload = c.req.valid("json")

      const post = await getPost(id)

      if (
        PermissionsService
          .Post({
            user,
            post
          })
          .cannot("update", "Post")
      )
        throw new APIError("You do not have permission to update this post!", { code: StatusCodes.FORBIDDEN })

      await PostRepository.updatePost(id, payload)

      return c.json({ message: "Post updated successfully!" })
    })
  .delete("/:id",
    JwtMiddleware.verify,
    zValidator("param", deletePost),
    async (c) => {
      const user = c.var.user
      const { id } = c.req.valid("param")

      const post = await getPost(id)

      if (
        PermissionsService
          .Post({
            user,
            post
          })
          .cannot("delete", "Post")
      )
        throw new APIError("You do not have permission to delete this post!", { code: StatusCodes.FORBIDDEN })

      await PostRepository.deletePost(id)

      return c.json({ message: "Post deleted successfully!" })
    })
