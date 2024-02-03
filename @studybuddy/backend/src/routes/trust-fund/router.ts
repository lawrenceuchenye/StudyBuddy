import TrustRepository from "@studybuddy/backend/repositories/trust-fund";
import { APIError } from "@studybuddy/backend/utils/error";
import { transformMongoId } from "@studybuddy/backend/utils/validator";
import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import Pagination from "@studybuddy/backend/utils/pagination";
import { zValidator } from "@hono/zod-validator";
import { createSchema, depositSchema, filterSchema, updateSchema } from "./schema";
import JwtMiddleware from "@studybuddy/backend/middleware/jwt";
import PermissionsService from "@studybuddy/backend/services/permissions";
import { Types } from "mongoose";
import TrustFundService from "@studybuddy/backend/services/trust-fund";

const getTrustFund = async (id: Types.ObjectId) => {
  const trustFund = await TrustRepository.getTrustFund(id)

  if (!trustFund)
    throw new APIError("Trust fund not found!", { code: StatusCodes.NOT_FOUND })

  return trustFund
}

export default new Hono()
  .post("/",
    JwtMiddleware.verify,
    zValidator("json", createSchema),
    async (c) => {
      const trustFundPayload = c.req.valid("json")
      const user = c.var.user

      const trustFund = await TrustRepository.createTrustFund({
        ...trustFundPayload,
        balance: 0,
        creatorId: user._id,
      })

      return c.json(Pagination.createSingleResource(trustFund))
    })
  .get("/",
    zValidator("query", Pagination.schema.merge(filterSchema)),
    async (c) => {
      const { page, perPage, ...filters } = c.req.valid("query")

      return c.json(
        await TrustRepository.getTrustFunds(filters, { page, perPage })
      )
    })
  .get("/:id", async (c) => {
    const trustFundId = z.string().transform(transformMongoId).parse(c.req.param("id"))
    const trustFund = await getTrustFund(trustFundId)

    return c.json(Pagination.createSingleResource(trustFund.toJSON()))
  })
  .post("/:id/deposit",
    JwtMiddleware.verify,
    zValidator("json", depositSchema),
    async (c) => {
      const user = c.var.user
      const trustFundId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const payload = c.req.valid("json")

      const trustFund = await getTrustFund(trustFundId)

      const paymentLink = await TrustFundService.getPaymentLink(trustFund, payload.amount, user)

      if (!paymentLink)
        throw new APIError("Failed to create payment link!", { code: StatusCodes.INTERNAL_SERVER_ERROR })

      return c.json(Pagination.createSingleResource({ url: paymentLink }))
    })
  .post("/:id/withdraw",
    JwtMiddleware.verify,
    async (c) => {
      const user = c.var.user
      const trustFundId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const trustFund = await getTrustFund(trustFundId)

      if (
        PermissionsService
          .TrustFund({
            trustFund,
            user
          })
          .cannot("withdraw", "TrustFund")
      )
        throw new APIError("You are not allowed to withdraw from this trust fund!", { code: StatusCodes.FORBIDDEN })

      const success = await TrustFundService.withdrawFromTrustFund(trustFund)

      if (!success)
        throw new APIError("Failed to withdraw from trust fund!", { code: StatusCodes.INTERNAL_SERVER_ERROR })

      return c.json({ message: "Your funds are on their way to your account." })
    })
  .patch("/:id",
    JwtMiddleware.verify,
    zValidator("json", updateSchema),
    async (c) => {
      const trustFundPayload = c.req.valid("json")
      const trustFundId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const user = c.var.user

      const trustFund = await TrustRepository.getTrustFund(trustFundId)

      if (!trustFund)
        throw new APIError("Trust fund not found!", { code: StatusCodes.NOT_FOUND })

      if (
        PermissionsService
          .TrustFund({
            user,
            trustFund,
          })
          .cannot("update", "TrustFund")
      )
        throw new APIError("You are not allowed to update this trust fund!", { code: StatusCodes.FORBIDDEN })

      await TrustRepository.updateTrustFund(trustFundId, trustFundPayload)

      return c.json({ message: "Trust fund updated successfully!" })
    })
  .delete("/:id",
    JwtMiddleware.verify,
    async (c) => {
      const trustFundId = z.string().transform(transformMongoId).parse(c.req.param("id"))

      const user = c.var.user

      const trustFund = await TrustRepository.getTrustFund(trustFundId)

      if (!trustFund)
        throw new APIError("Trust fund not found!", { code: StatusCodes.NOT_FOUND })

      if (
        PermissionsService
          .TrustFund({
            user,
            trustFund,
          })
          .cannot("delete", "TrustFund")
      )
        throw new APIError("You are not allowed to update this trust fund!", { code: StatusCodes.FORBIDDEN })

      await TrustRepository.deleteTrustFund(trustFundId)

      return c.json({ message: "Trust fund deleted successfully!" })
    })
