import { Hono } from "hono";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";

export default new Hono()
  .post("/",
    zValidator("json", z.object({
      name: z.string().min(3),
      description: z.string().min(3),
      subjects: z.array(z.string().min(3)),
    })),
    async (c) => {
      const { name, description, subjects } = c.req.valid("json")
      const channel = await ChannelRepository.createChannel({
        name,
        description,
        subjects,
        creatorId: new Types.ObjectId(""), // TODO: Get creator id from auth token
      })
      return c.json({
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
        return c.json({ message: channelsResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

      return c.json(channelsResult.value)
    })
  .get("/:id",
    async (c) => {
      const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const channelResult = await ChannelRepository.getChannel({ id })

      if (channelResult.isErr)
        return c.json({ message: channelResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

      const maybeChannel = channelResult.value

      if (maybeChannel.isNothing)
        return c.json({ message: "Channel not found" }, StatusCodes.NOT_FOUND)

      return c.json(Pagination.createSingleResource(maybeChannel.value))
    })
  .patch("/:id",
    zValidator("json", z.object({
      name: z.string().min(3),
      description: z.string().min(3),
      subjects: z.array(z.string().min(3)),
    }).partial()),
    async (c) => {
      // TODO: Check if user is channel creator or a mod

      const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const { name, description, subjects } = c.req.valid("json")
      const updateResult = await ChannelRepository.updateChannel({
        id,
        name,
        description,
        subjects
      })

      if (updateResult.isErr)
        return c.json({ message: updateResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

      return c.json({ message: "Channel updated successfully!" })
    })
  .post("/:id/join", async (c) => {
    const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const joinResult = await ChannelRepository.addUserToChannel({
      channelId: id,
      userId: new Types.ObjectId("") // TODO: Get user id from auth token
    })

    if (joinResult.isErr)
      return c.json({ message: joinResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

    return c.json({ message: "Channel joined successfully!" })
  })
  .post("/:id/leave", async (c) => {
    const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const removeREsult = await ChannelRepository.removeUserFromChannel({
      channelId: id,
      userId: new Types.ObjectId("") // TODO: Get user id from auth token
    })

    if (removeREsult.isErr)
      return c.json({ message: removeREsult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

    return c.json({ message: "Left channel successfully!" })
  })
  .delete("/:id/members/:memberId", async (c) => {
    const {
      id,
      memberId
    } = z.object({
      id: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())
    // TODO: Check if user is channel creator or a mod

    const removeResult = await ChannelRepository.removeUserFromChannel({
      channelId: id,
      userId: memberId
    })

    if (removeResult.isErr)
      return c.json({ message: removeResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

    return c.json({ message: "Left channel successfully!" })
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
      return c.json({ message: usersResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

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
      return c.json({ message: userResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

    return c.json(userResult.value)
  })
  .get("/:id/messages", async (c) => {
    // TODO: Check if user is in channel

    const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
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

    const messagesResult = await ChannelRepository.getMessagesInChannel({
      channelId: id
    }, { page, perPage }, filters)

    if (messagesResult.isErr)
      return c.json({ message: messagesResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

    return c.json(messagesResult.value)
  })
  .patch("/:channelId/messages/:messageId",
    zValidator("json", z.object({
      content: z.string().trim().min(1),
      mediaIds: z.array(z.string().transform(transformMongoId)).optional(),
    }).partial()),
    async (c) => {
      // TODO: Check if user is the sender of message

      const {
        channelId,
        messageId
      } = z.object({
        channelId: z.string().transform(transformMongoId),
        messageId: z.string().transform(transformMongoId),
      }).parse(c.req.param())

      const payload = c.req.valid("json")
      const updateResult = await ChannelRepository.updateMessageInChannel({
        ...payload,
        messageId: messageId,
        channelId,
      })

      if (updateResult.isErr)
        return c.json({ message: updateResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

      return c.json({ message: "Message updated successfully!" })
    })
  .delete("/:channelId/messages/:messageId", async (c) => {
    // TODO: Check if user is message sender or mod

    const {
      channelId,
      messageId
    } = z.object({
      channelId: z.string().transform(transformMongoId),
      messageId: z.string().transform(transformMongoId),
    }).parse(c.req.param())
    const deleteResult = await ChannelRepository.deleteMessageInChannel({ messageId: messageId, channelId })

    if (deleteResult.isErr)
      return c.json({ message: deleteResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

    return c.json({ message: "Message deleted successfully!" })
  })
  .delete("/:id", async (c) => {
    // TODO: Check if user is channel creator

    const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const deleteResult = await ChannelRepository.deleteChannel({ id })

    if (deleteResult.isErr)
      return c.json({ message: deleteResult.error }, StatusCodes.INTERNAL_SERVER_ERROR)

    return c.json({ message: "Channel deleted successfully!" })
  })

