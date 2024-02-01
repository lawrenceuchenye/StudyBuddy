import { Hono } from "hono";
import StudyGroupRepository from "@studybuddy/backend/repositories/study-group";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { updateStudyGroupSchema } from "./schema";
import { deleteStudyGroupById, updateStudyGroupById } from "./controller";
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
