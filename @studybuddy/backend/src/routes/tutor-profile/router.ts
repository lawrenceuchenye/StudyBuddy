import JwtMiddleware from "@studybuddy/backend/middleware/jwt"
import { Hono } from "hono"
import { createTutorProfileSchema, findTutorProfileSchema, getTutorProfileSchema, updateTutorProfileSchema } from "./schema"
import { zValidator } from "@hono/zod-validator"
import TutorProfileRepository from "@studybuddy/backend/repositories/tutor-profile"
import { APIError } from "@studybuddy/backend/utils/error"
import { StatusCodes } from "http-status-codes"
import Pagination from "@studybuddy/backend/utils/pagination"
import { Types } from "mongoose"
import PermissionsService from "@studybuddy/backend/services/permissions"

export const getTutorProfile = async (id: Types.ObjectId) => TutorProfileRepository.getTutorProfile(id)
  .then(tutorProfile => {
    if (tutorProfile)
      return tutorProfile

    throw new APIError("Tutor profile not found!", { code: StatusCodes.NOT_FOUND })
  })

export default new Hono()
  .post("/",
    JwtMiddleware.verify,
    zValidator("json", createTutorProfileSchema),
    async (c) => {
      const payload = c.req.valid("json")
      const user = c.var.user

      const existitngTutorProfile = await TutorProfileRepository.getTutorProfile(user._id)

      if (!existitngTutorProfile)
        throw new APIError("You can only have one tutor profile at a time!", { code: StatusCodes.CONFLICT })

      const tutorProfile = await TutorProfileRepository.createTutorProfile({
        ...payload,
        _id: user._id,
      })

      return c.json(Pagination.createSingleResource(tutorProfile.toJSON()))
    })
  .get("/:id",
    zValidator("param", getTutorProfileSchema),
    async (c) => {
      const { id } = c.req.valid("param")

      const tutorProfile = await getTutorProfile(id)

      return c.json(Pagination.createSingleResource(tutorProfile.toJSON()))
    })
  .get("/",
    zValidator("query", findTutorProfileSchema),
    async (c) => {
      const { page, perPage, name } = c.req.valid("query")

      return c.json(await TutorProfileRepository.getTutorProfiles({ page, perPage }, { name }))
    })
  .patch("/:id",
    zValidator("json", updateTutorProfileSchema),
    async (c) => {
      const payload = c.req.valid("json")
      const user = c.var.user
      const tutorProfile = await getTutorProfile(user._id)

      if (
        PermissionsService
          .TutorProfile({ user, tutorProfile })
          .cannot("update", "TutorProfile")
      )
        throw new APIError("You are not allowed to update this profile!", { code: StatusCodes.UNAUTHORIZED })

      await TutorProfileRepository.updateTutorProfile(user._id, payload)

      return c.json({ message: "Updated tutor profile successfully!" })
    })
  .delete("/:id", async (c) => {
    const user = c.var.user
    const tutorProfile = await getTutorProfile(user._id)

    if (
      PermissionsService
        .TutorProfile({ user, tutorProfile })
        .cannot("delete", "TutorProfile")
    )
      throw new APIError("You are not allowed to delete this profile!", { code: StatusCodes.UNAUTHORIZED })

    await TutorProfileRepository.deleteTutorProfile(user._id)

    return c.json({ message: "Deleted tutor profile successfully!" })
  })

