import { Types } from "mongoose"
import { ITrustFund, TrustFund } from "../models/trust-fund"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"

namespace TrustFundRepository {
  type CreateTrustFundPayload = Omit<ITrustFund, "createdAt">

  export const createTrustFund = async (payload: CreateTrustFundPayload) => {
    return TrustFund.create(payload)
  }

  export const getTrustFund = async (id: Types.ObjectId) => {
    return await TrustFund.findById(id)
  }

  type GetTrustFundsPayload = {

  }

  export const getTrustFunds = async (payload: GetTrustFundsPayload) => {

  }

  type UpdateTrustFundPayload = Partial<CreateTrustFundPayload>

  export const updateTrustFund = async (id: Types.ObjectId, payload: UpdateTrustFundPayload) => {
    await TrustFund.

  }

  export const deleteTrustFund = async (id: Types.ObjectId) => {
    const { acknowledged } = await TrustFund.deleteOne({ _id: id })
    if (!acknowledged)
      throw new APIError("Failed to delete media", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default TrustFundRepository
