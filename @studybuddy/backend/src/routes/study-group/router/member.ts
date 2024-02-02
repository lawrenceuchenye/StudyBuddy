import { Hono } from "hono";
import StudyGroupRepository from "@studybuddy/backend/repositories/study-group";
import { z } from "zod"
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { getMember, addUserToStudyGroup, removeUserFromStudyGroup, leaveStudyGroup } from "./controller";

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
  .get("/:id/members/:memberId", async (c) => {
    const studyGroupId = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const memberId = z.string().transform(transformMongoId).parse(c.req.param("memberId"))

    const member = await getMember(memberId, studyGroupId)

    return c.json({ message: "Fetched member successfully", data: member.toJSON() })
  })
  .post("/:id/members/:memberId",
    JwtMiddleware.verify,
    async (c) => {
      const studyGroupId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const memberId = z.string().transform(transformMongoId).parse(c.req.param("memberId"))

      const creator = c.var.user

      const studyGroupUser = await addUserToStudyGroup(studyGroupId, memberId, creator)

      return c.json({ message: "Study group member added successfully!", data: studyGroupUser.toJSON() })
    })
  .delete("/:id/members/:memberId",
    JwtMiddleware.verify,
    async (c) => {
      const studyGroupId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const memberId = z.string().transform(transformMongoId).parse(c.req.param("memberId"))

      const user = c.var.user

      await removeUserFromStudyGroup(
        studyGroupId,
        memberId,
        user
      )

      return c.json({ message: "Removed user successfully!" })
    })
  .post("/:id/members/leave",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const studyGroupId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      await leaveStudyGroup(studyGroupId, user)

      return c.json({ message: "Left channel successfully!" })
    })
