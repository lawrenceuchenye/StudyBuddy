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
import { APIError } from "@studybuddy/backend/utils/error";
import { IChannel } from "@studybuddy/backend/models/channel";

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
      const channel = await ChannelRepository.createChannel({
        name,
        description,
        subjects,
        creatorId: user._id
      })

      return c.json({
        data: channel.toJSON(),
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

      const paginatedChannels = await ChannelRepository.getChannels({ page, perPage }, filters)

      return c.json(paginatedChannels)
    })
  .get("/:id",
    async (c) => {
      const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const channel = await ChannelRepository.getChannel({ id })

      if (!channel)
        throw new APIError("Channel not found", { code: StatusCodes.NOT_FOUND })

      return c.json(Pagination.createSingleResource(channel.toJSON()))
    })
  .patch("/:id",
    JwtMiddleware.verify,
    zValidator("json", updateChannelSchema),
    async (c) => {
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const payload = c.req.valid("json")

      const user = c.var.user

      await updateChannelById(channelId, payload, user)

      return c.json({ message: "Channel updated successfully!" })
    })
  .delete("/:id",
    JwtMiddleware.verify,
    async (c) => {
      const channelId = z.string()
        .transform(transformMongoId).parse(c.req.param("id"))

      const user = c.var.user
      await deleteChannelById(channelId, user)

      return c.json({ message: "Channel deleted successfully!" })
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

    const paginatedMembers = await ChannelRepository.getMembers({
      id
    }, { page, perPage }, filters)

    return c.json(paginatedMembers)
  })
  .get("/:id/members/profile", JwtMiddleware.verify, async (c) => {
    const {
      id,
    } = z.object({
      id: z.string().transform(transformMongoId),
    }).parse(c.req.param())

    const user = c.var.user

    const member = await ChannelRepository.getMember({
      channelId: id,
      userId: user._id
    })

    if (!member)
      throw new APIError("User not found in channel", { code: StatusCodes.NOT_FOUND })

    return c.json(member)
  })
  .get("/:channelId/members/:memberId", async (c) => {
    const {
      channelId,
      memberId
    } = z.object({
      channelId: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())

    const member = await ChannelRepository.getMember({
      channelId: channelId,
      userId: memberId
    })

    if (!member)
      throw new APIError("User not found in channel", { code: StatusCodes.NOT_FOUND })

    return c.json({ message: "Fetched member successfully", data: member.toJSON() })
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

      await promoteChannelUser(channelId, memberId, role, user)

      return c.json({ message: "Updated user successfully!" })
    })
  .post("/:id/join",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const channelUser = await joinChannel(channelId, user)

      return c.json({ message: "Channel joined successfully!", data: channelUser.toJSON() })
    })
  .post("/:id/leave",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      await leaveChannel(channelId, user)

      return c.json({ message: "Left channel successfully!" })
    })
  .delete("/:channelId/members/:memberId", async (c) => {
    const {
      id: channelId,
      memberId
    } = z.object({
      id: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())

    const user = c.var.user

    await removeUserFromChannel(channelId, memberId, user)

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

      const message = await postChannelMessage(channelId, payload, user)

      return c.json({ message: "Message posted successfully!", data: message })
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

    const paginatedMessages = await ChannelRepository.getMessages({
      channelId
    }, { page, perPage }, filters)

    return c.json(paginatedMessages)
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

      await updateChannelMessage(channelId, messageId, payload, user)

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

      await deleteChannelMessage(channelId, messageId, user)

      return c.json({ message: "Message deleted successfully!" })
    })
