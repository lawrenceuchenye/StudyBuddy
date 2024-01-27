import { Hono } from "hono";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { postChannelMessageSchema, updateChannelMessageSchema, updateChannelSchema } from "./schema";
import { deleteChannelById, deleteChannelMessage, joinChannel, leaveChannel, postChannelMessage, promoteChannelUser, removeUserFromChannel, updateChannelById, updateChannelMessage } from "./controller";

export default new Hono()
  .post("/",
    JwtMiddleware.verify,
    zValidator("json", z.object({
      name: z.string().min(3),
      description: z.string().min(3),
      subjects: z.array(z.string().min(3)),
    })),
    async (c) => {
      const user = c.var.user
      const { name, description, subjects } = c.req.valid("json")
      const creationResult = await ChannelRepository.createChannel({
        name,
        description,
        subjects,
        creatorId: user._id
      })

      if (creationResult.isErr)
        return c.json({
          status: "failed",
          message: creationResult.error.message
        },
          creationResult.error.code)
      const channel = creationResult.value

      return c.json({
        status: "success",
        data: channel,
        message: "Channel created successfully!"
      }, StatusCodes.CREATED)
    })
  .get("/",
    async (c) => {
      const filterSchema = z.object({
        name: z.string(),
        subjects: z.array(z.string()),
        createdBefore: z.date(),
        createdAfter: z.date(),
      }).partial()
      const {
        page,
        perPage,
        ...filters
      } = Pagination.schema.merge(filterSchema).parse(c.req.query())

      const channelsResult = await ChannelRepository.getChannels({ page, perPage }, filters)

      if (channelsResult.isErr)
        return c.json({ message: channelsResult.error.message }, channelsResult.error.code)

      return c.json(channelsResult.value)
    })
  .get("/:id",
    async (c) => {
      const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const channelResult = await ChannelRepository.getChannel({ id })

      if (channelResult.isErr)
        return c.json({ message: channelResult.error.message }, channelResult.error.code)

      const maybeChannel = channelResult.value

      if (maybeChannel.isNothing)
        return c.json({ message: "Channel not found" }, StatusCodes.NOT_FOUND)

      return c.json(Pagination.createSingleResource(maybeChannel.value))
    })
  .patch("/:id",
    JwtMiddleware.verify,
    zValidator("json", updateChannelSchema),
    async (c) => {
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const payload = c.req.valid("json")

      const user = c.var.user

      const updateResult = await updateChannelById(channelId, payload, user)

      if (updateResult.isErr)
        return c.json({ message: updateResult.error.message }, updateResult.error.code)

      return c.json({ message: "Channel updated successfully!" })
    })
  .delete("/:id",
    JwtMiddleware.verify,
    async (c) => {
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const user = c.var.user
      const deleteResult = await deleteChannelById(channelId, user)

      if (deleteResult.isErr)
        return c.json({ message: deleteResult.error.message }, deleteResult.error.code)

      return c.json({ message: "Channel deleted successfully!" })
    })
  .post("/:id/join",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const joinResult = await joinChannel(channelId, user)
      if (joinResult.isErr)
        return c.json({ message: joinResult.error.message }, joinResult.error.code)

      return c.json({ message: "Channel joined successfully!" })
    })
  .get("/:id/members", async (c) => {
    const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const filterSchema = z.object({
      name: z.string(),
      username: z.string()
    }).partial()
    const {
      page,
      perPage,
      ...filters
    } = Pagination.schema.merge(filterSchema).parse(c.req.query())

    const usersResult = await ChannelRepository.getUsersInChannel({
      id
    }, { page, perPage }, filters)

    if (usersResult.isErr)
      return c.json({ message: usersResult.error.message }, usersResult.error.code)

    return c.json(usersResult.value)
  })
  .get("/:id/members/:memberId", async (c) => {
    const {
      id,
      memberId
    } = z.object({
      id: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())

    const userResult = await ChannelRepository.getUserInChannel({
      channelId: id,
      userId: memberId
    })

    if (userResult.isErr)
      return c.json({ message: userResult.error.message }, userResult.error.code)

    return c.json(userResult.value)
  })
  .patch("/:channelId/members/:memberId",
    JwtMiddleware.verify,
    zValidator("json", z.object({
      role: z.enum(["TUTOR"]).optional()
    })),
    async (c) => {
      const {
        channelId,
        memberId
      } = z.object({
        channelId: z.string().transform(transformMongoId),
        memberId: z.string().transform(transformMongoId)
      }).parse(c.req.param())
      const { role } = c.req.valid("json")

      const user = c.var.user

      const updateResult = await promoteChannelUser(channelId, memberId, role, user)

      if (updateResult.isErr)
        return c.json({ message: updateResult.error.message }, updateResult.error.code)

      return c.json({ message: "Updated user successfully!" })
    })
  .post("/:id/leave",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const leaveResult = await leaveChannel(channelId, user)

      if (leaveResult.isErr)
        return c.json({ message: leaveResult.error.message }, leaveResult.error.code)

      return c.json({ message: "Left channel successfully!" })
    })
  .delete("/:id/members/:memberId", async (c) => {
    const {
      id: channelId,
      memberId
    } = z.object({
      id: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())

    const user = c.var.user

    const removeResult = await removeUserFromChannel(channelId, memberId, user)

    if (removeResult.isErr)
      return c.json({ message: removeResult.error.message }, removeResult.error.code)

    return c.json({ message: "Removed user successfully!" })
  })
  .post("/:id/messages",
    async (c) => {
      const body = await c.req.parseBody()
      const payload = postChannelMessageSchema
        .parse({
          content: body.content,
          media: body.media
        })
      const channelId = z.string()
        .transform(transformMongoId).parse(c.req.param("id"))

      const user = c.var.user

      const messageCreationResult = await postChannelMessage(channelId, payload, user)

      if (messageCreationResult.isErr)
        return c.json({ message: messageCreationResult.error.message }, messageCreationResult.error.code)

      return c.json({ message: "Message posted successfully!" })
    })
  .get("/:id/messages", async (c) => {
    const filterSchema = z.object({
      contains: z.string(),
      sentBefore: z.date(),
      sentAfter: z.date()
    }).partial()
    const {
      page,
      perPage,
      ...filters
    } = Pagination.schema.merge(filterSchema).parse(c.req.query())
    const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

    const messagesResult = await ChannelRepository.getMessagesInChannel({
      channelId
    }, { page, perPage }, filters)

    if (messagesResult.isErr)
      return c.json({ message: messagesResult.error.message }, messagesResult.error.code)

    return c.json(messagesResult.value)
  })
  .patch("/:channelId/messages/:messageId",
    zValidator("json", updateChannelMessageSchema),
    async (c) => {
      const {
        channelId,
        messageId
      } = z.object({
        channelId: z.string().transform(transformMongoId),
        messageId: z.string().transform(transformMongoId),
      }).parse(c.req.param())
      const payload = c.req.valid("json")

      const user = c.var.user

      const updateResult = await updateChannelMessage(channelId, messageId, payload, user)

      if (updateResult.isErr)
        return c.json({ message: updateResult.error.message }, updateResult.error.code)

      return c.json({ message: "Message updated successfully!" })
    })
  .delete("/:channelId/messages/:messageId",
    JwtMiddleware.verify,
    async (c) => {
      const {
        channelId,
        messageId
      } = z.object({
        channelId: z.string().transform(transformMongoId),
        messageId: z.string().transform(transformMongoId),
      }).parse(c.req.param())

      const user = c.var.user

      const deleteResult = await deleteChannelMessage(channelId, messageId, user)

      if (deleteResult.isErr)
        return c.json({ message: deleteResult.error.message }, deleteResult.error.code)

      return c.json({ message: "Message deleted successfully!" })
    })
