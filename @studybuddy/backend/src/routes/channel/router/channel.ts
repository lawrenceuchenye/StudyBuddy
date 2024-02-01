import { Hono } from "hono";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { postChannelMessageSchema, updateChannelMessageSchema, updateChannelSchema } from "./schema";
import { deleteChannelById, deleteChannelMessage, getMember, joinChannel, leaveChannel, postChannelMessage, promoteChannelMember, removeUserFromChannel, updateChannelById, updateChannelMessage } from "./controller";
import { APIError } from "@studybuddy/backend/utils/error";
import JWTConfig from "@studybuddy/backend/config/jwt";

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
