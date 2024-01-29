import { Hono } from "hono";
import StudyGroupRepository from "@studybuddy/backend/repositories/study-group";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { postStudyGroupMessageSchema, updateStudyGroupMessageSchema, updateStudyGroupSchema } from "./schema";
import { deleteStudyGroupById, deleteStudyGroupMessage, leaveStudyGroup, getMember, addUserToStudyGroup, postStudyGroupMessage, removeUserFromStudyGroup, updateStudyGroupById, updateStudyGroupMessage } from "./controller";
import { APIError } from "@studybuddy/backend/utils/error";

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
      const studyGroup = await StudyGroupRepository.createStudyGroup({
        name,
        description,
        subjects,
        creatorId: user._id
      })

      return c.json({
        data: studyGroup.toJSON(),
        message: "Study group created successfully!"
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

      const paginatedStudyGroups = await StudyGroupRepository.getStudyGroups({ page, perPage }, filters)

      return c.json(paginatedStudyGroups)
    })
  .get("/:id",
    async (c) => {
      const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const studyGroup = await StudyGroupRepository.getStudyGroup({ id })

      if (!studyGroup)
        throw new APIError("Study group not found", { code: StatusCodes.NOT_FOUND })

      return c.json(Pagination.createSingleResource(studyGroup.toJSON()))
    })
  .patch("/:id",
    JwtMiddleware.verify,
    zValidator("json", updateStudyGroupSchema),
    async (c) => {
      const studyGroupId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const payload = c.req.valid("json")

      const user = c.var.user

      await updateStudyGroupById(studyGroupId, payload, user)

      return c.json({ message: "Study group updated successfully!" })
    })
  .delete("/:id",
    JwtMiddleware.verify,
    async (c) => {
      const studyGroupId = z.string()
        .transform(transformMongoId).parse(c.req.param("id"))

      const user = c.var.user
      await deleteStudyGroupById(studyGroupId, user)

      return c.json({ message: "Study group deleted successfully!" })
    })
  .post("/:id/leave",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const studyGroupId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      await leaveStudyGroup(studyGroupId, user)

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

    const paginatedMembers = await StudyGroupRepository.getMembers({
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

    const member = await getMember(user._id, id)

    return c.json(member)
  })
  .get("/:studyGroupId/members/:memberId", async (c) => {
    const {
      studyGroupId,
      memberId
    } = z.object({
      studyGroupId: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())

    const member = await getMember(memberId, studyGroupId)

    return c.json({ message: "Fetched member successfully", data: member.toJSON() })
  })
  .post("/:studyGroupId/members/:memberId",
    JwtMiddleware.verify,
    async (c) => {
      const {
        studyGroupId,
        memberId
      } = z.object({
        memberId: z.string()
          .transform(transformMongoId),
        studyGroupId: z.string()
          .transform(transformMongoId)
      })
        .parse({
          memberId: c.req.param("memberId"),
          studyGroupId: c.req.param("studyGroupId")
        })

      const creator = c.var.user

      const studyGroupUser = await addUserToStudyGroup(studyGroupId, memberId, creator)

      return c.json({ message: "Study group member added successfully!", data: studyGroupUser.toJSON() })
    })
  .delete("/:studyGroupId/members/:memberId", async (c) => {
    const {
      id: studyGroupId,
      memberId
    } = z.object({
      id: z.string().transform(transformMongoId),
      memberId: z.string().transform(transformMongoId)
    }).parse(c.req.param())

    const user = c.var.user

    await removeUserFromStudyGroup(studyGroupId, memberId, user)

    return c.json({ message: "Removed user successfully!" })
  })
  .post("/:id/messages",
    JwtMiddleware.verify,
    async (c) => {
      const body = await c.req.parseBody()
      const payload = postStudyGroupMessageSchema
        .parse({
          content: body.content,
          media: body["media[]"]
        })
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
