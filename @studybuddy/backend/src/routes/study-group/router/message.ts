import { Hono } from "hono";
import StudyGroupRepository from "@studybuddy/backend/repositories/study-group";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { postStudyGroupMessageSchema, updateStudyGroupMessageSchema } from "./schema";
import { deleteStudyGroupMessage, postStudyGroupMessage, updateStudyGroupMessage } from "./controller";

export default new Hono()
  .post("/:id/messages",
    JwtMiddleware.verify,
    zValidator("json", postStudyGroupMessageSchema),
    async (c) => {
    const payload = c.req.valid("json")
      const studyGroupId = z.string()
        .transform(transformMongoId)
        .parse(c.req.param("id"))

      const user = c.var.user

      const message = await postStudyGroupMessage(studyGroupId, payload, user)

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
    const studyGroupId = z.string().transform(transformMongoId).parse(c.req.param("id"))

    const paginatedMessages = await StudyGroupRepository.getMessages({
      studyGroupId
    }, { page, perPage }, filters)

    return c.json(paginatedMessages)
  })
  .patch("/:studyGroupId/messages/:messageId",
    zValidator("json", updateStudyGroupMessageSchema),
    async (c) => {
      const {
        studyGroupId,
        messageId
      } = z.object({
        studyGroupId: z.string().transform(transformMongoId),
        messageId: z.string().transform(transformMongoId),
      }).parse(c.req.param())
      const payload = c.req.valid("json")

      const user = c.var.user

      await updateStudyGroupMessage(studyGroupId, messageId, payload, user)

      return c.json({ message: "Message updated successfully!" })
    })
  .delete("/:studyGroupId/messages/:messageId",
    JwtMiddleware.verify,
    async (c) => {
      const {
        studyGroupId,
        messageId
      } = z.object({
        studyGroupId: z.string().transform(transformMongoId),
        messageId: z.string().transform(transformMongoId),
      }).parse(c.req.param())

      const user = c.var.user

      await deleteStudyGroupMessage(studyGroupId, messageId, user)

      return c.json({ message: "Message deleted successfully!" })
    })
