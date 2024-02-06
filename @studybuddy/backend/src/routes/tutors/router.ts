import JwtMiddleware from "@studybuddy/backend/middleware/jwt"
import { Hono } from "hono"
import { createTutorSchema, findTutorSchema, getTutorSchema, updateTutorSchema } from "./schema"
import { zValidator } from "@hono/zod-validator"
import TutorRepository from "@studybuddy/backend/repositories/tutor"
import { APIError } from "@studybuddy/backend/utils/error"
import { StatusCodes } from "http-status-codes"
import Pagination from "@studybuddy/backend/utils/pagination"
import { Types } from "mongoose"

export const getTutorProfile = async (id: Types.ObjectId) => TutorRepository.getTutor(id)
  .then(tutorProfile => {
    if (tutorProfile)
      return tutorProfile

    throw new APIError("Tutor profile not found!", { code: StatusCodes.NOT_FOUND })
  })

export default new Hono()
  .post("/",
    JwtMiddleware.verify,
    zValidator("json", createTutorSchema),
    async (c) => {
      const payload = c.req.valid("json")
      const user = c.var.user

      const existitngTutorProfile = await TutorRepository.getTutor(user._id)

      if (!existitngTutorProfile)
        throw new APIError("Tutor profile already exists", { code: StatusCodes.CONFLICT })

      const tutorProfile = await TutorRepository.createTutor({
        ...payload,
        _id: user._id,
      })

      return c.json(Pagination.createSingleResource(tutorProfile.toJSON()))
    })
  .get("/:id",
    zValidator("param", getTutorSchema),
    async (c) => {
      const { id } = c.req.valid("param")

      const tutorProfile = await getTutorProfile(id)

      return c.json(Pagination.createSingleResource(tutorProfile.toJSON()))
    })
  .get("/",
    zValidator("query", findTutorSchema),
    async (c) => {
      const { page, perPage, name } = c.req.valid("query")

      return c.json(await TutorRepository.getTutors({ page, perPage }, { name }))
    })
  .patch("/:id",
    zValidator("json", updateTutorSchema),
    async (c) => {
      const payload = c.req.valid("json")

      return c.json({ message: "Updated tutor profile successfully!" })
    })

