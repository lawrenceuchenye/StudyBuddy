import { Hono } from "hono";
import ResourceRepository from "@studybuddy/backend/repositories/resource";
import { z } from "zod"
import { zValidator } from '@hono/zod-validator'
import { StatusCodes } from "http-status-codes";
import Pagination from "@studybuddy/backend/utils/pagination";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import { createResourceSchema, updateResourceSchema } from "./schema";
import { APIError } from "@studybuddy/backend/utils/error";
import PermissionsService from "@studybuddy/backend/services/permissions";
import { Types } from "mongoose";

const getResource = async (resourceId: Types.ObjectId) => {
  const resource = await ResourceRepository.getResource({
    id: resourceId
  })

  if (!resource)
    throw new APIError("Resource not found!", { code: StatusCodes.NOT_FOUND })

  return resource
}

export default new Hono()
  .post("/",
    JwtMiddleware.verify,
    zValidator("json", createResourceSchema),
    async (c) => {
      const user = c.var.user
      const payload = c.req.valid("json")

      const resource = await ResourceRepository.createResource({
        ...payload,
        creatorId: user._id
      })

      return c.json({
        data: resource.toJSON(),
        message: "Resource created successfully!"
      }, StatusCodes.CREATED)
    })
  .get("/",
    async (c) => {
      const filterSchema = z.object({
        title: z.string(),
        subjects: z.array(z.string()),
        shortDescription: z.string(),
        longDescription: z.string(),
        createdBefore: z.date(),
        createdAfter: z.date(),
      }).partial()
      const {
        page,
        perPage,
        ...filters
      } = Pagination.schema.merge(filterSchema).parse(c.req.query())

      const paginatedResources = await ResourceRepository.getResources({ page, perPage }, filters)

      return c.json(paginatedResources)
    })
  .get("/:id",
    async (c) => {
      const id = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const resource = await ResourceRepository.getResource({ id })

      if (!resource)
        throw new APIError("Resource not found", { code: StatusCodes.NOT_FOUND })

      return c.json(Pagination.createSingleResource(resource.toJSON()))
    })
  .patch("/:id",
    JwtMiddleware.verify,
    zValidator("json", updateResourceSchema),
    async (c) => {
      const resourceId = z.string().transform(transformMongoId).parse(c.req.param("id"))
      const payload = c.req.valid("json")
      const resource = await getResource(resourceId)

      const user = c.var.user

      if (
        PermissionsService
          .Resource({
            user,
            resource
          })
          .cannot("update", PermissionsService.subject("Resource", resource))
      )
        throw new APIError("You do not have permission to update this resource!", { code: StatusCodes.FORBIDDEN })

      await ResourceRepository
        .updateResource({
          ...payload,
          id: resourceId
        })

      return c.json({ message: "Resource updated successfully!" })
    })
  .delete("/:id",
    JwtMiddleware.verify,
    async (c) => {
      const resourceId = z.string()
        .transform(transformMongoId).parse(c.req.param("id"))
      const resource = await getResource(resourceId)

      const user = c.var.user

      if (
        PermissionsService
          .Resource({
            user,
            resource
          })
          .cannot("delete", PermissionsService.subject("Resource", resource))
      )
        throw new APIError("You do not have permission to delete this resource!", { code: StatusCodes.FORBIDDEN })

      await ResourceRepository
        .deleteResource({
          id: resourceId
        })

      return c.json({ message: "Resource deleted successfully!" })
    })
