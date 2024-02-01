import { Hono } from "hono";
import ChannelRepository from "@studybuddy/backend/repositories/channel";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { getMember, joinChannel, leaveChannel, promoteChannelMember, removeUserFromChannel } from "./controller";

export default new Hono()
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
    const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

    const user = c.var.user

    const member = await getMember(user._id, channelId)

    return c.json(member)
  })
  .get("/:id/members/:memberId", async (c) => {
    const {
      channelId,
      memberId
    } = z.object({
      channelId: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())

    const member = await getMember(memberId, channelId)

    return c.json({ message: "Fetched member successfully", data: member.toJSON() })
  })
  .patch("/:id/members/:memberId",
    JwtMiddleware.verify,
    zValidator("json", z.object({
      role: z.enum(["TUTOR"]).nullable()
    })),
    async (c) => {
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const memberId = z.string().transform(transformMongoId).parse(c.req.param("memberId"))
      const { role } = c.req.valid("json")

      const user = c.var.user

      await promoteChannelMember(channelId, memberId, role, user)

      return c.json({ message: "Updated user successfully!" })
    })
  .post("/:id/members/join",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const channelMember = await joinChannel(channelId, user)

      return c.json({ message: "Channel joined successfully!", data: channelMember.toJSON() })
    })
  .post("/:id/members/leave",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      await leaveChannel(channelId, user)

      return c.json({ message: "Left channel successfully!" })
    })
  .delete("/:id/members/:memberId",
    JwtMiddleware.verify,
    async (c) => {
      const channelId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const memberId = z.string().transform(transformMongoId).parse(c.req.param("memberId"))

      const user = c.var.user

      await removeUserFromChannel(channelId, memberId, user)

      return c.json({ message: "Removed user successfully!" })
    })

