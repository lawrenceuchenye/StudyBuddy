import { Hono } from "hono";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { postChannelMessageSchema, updateChannelMessageSchema} from "./schema";
import { deleteChannelMessage, postChannelMessage, updateChannelMessage } from "./controller";

export default new Hono()
  .post("/:id/messages",
    JwtMiddleware.verify,
    zValidator("json", postChannelMessageSchema),
    async (c) => {
      const payload = c.req.valid("json")
      const channelId = z.string()
        .transform(transformMongoId)
        .parse(c.req.param("id"))

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
  .patch("/:id/messages/:messageId",
    zValidator("json", updateChannelMessageSchema),
    async (c) => {
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const messageId = z.string().transform(transformMongoId).parse(c.req.param("messageId"))
      const payload = c.req.valid("json")

      const user = c.var.user

      await updateChannelMessage(channelId, messageId, payload, user)

      return c.json({ message: "Message updated successfully!" })
    })
  .delete("/:id/messages/:messageId",
    JwtMiddleware.verify,
    async (c) => {
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const messageId = z.string().transform(transformMongoId).parse(c.req.param("messageId"))

      const user = c.var.user

      await deleteChannelMessage(channelId, messageId, user)

      return c.json({ message: "Message deleted successfully!" })
    })
