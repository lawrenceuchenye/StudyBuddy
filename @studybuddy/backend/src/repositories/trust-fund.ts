import { Types } from "mongoose"
import { ITrustFund, TrustFund } from "../models/trust-fund"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"
import Pagination from "../utils/pagination"

namespace TrustFundRepository {
  type CreateTrustFundPayload = Omit<ITrustFund, "createdAt">

  export const createTrustFund = async (payload: CreateTrustFundPayload) => {
    return TrustFund.create(payload)
  }

  export const getTrustFund = async (id: Types.ObjectId) => {
    return await TrustFund.findById(id)
  }

  type Filters = {
    text?: string
  }

  export const getTrustFunds = async (payload: Filters, paginationOptions: Pagination.QueryOptions) => {
    const query = TrustFund.find({
      $match: {
        $text: {
          $search: payload.text
        }
      }
    })
      .skip(paginationOptions.perPage * (paginationOptions.page - 1))
      .limit(paginationOptions.perPage)

    const trustFunds = await query
      .clone()
      .exec()

    const total = await query
      .countDocuments()

    return Pagination.createPaginatedResource(trustFunds.map(trustFund => trustFund.toJSON()), { ...paginationOptions, total })
  }

  type UpdateTrustFundPayload = Partial<CreateTrustFundPayload>

  export const updateTrustFund = async (id: Types.ObjectId, payload: UpdateTrustFundPayload) => {
    const { acknowledged } = await TrustFund.updateOne({ _id: id }, payload)
    if (!acknowledged)
      throw new APIError("Failed to update trust fund!", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  export const deleteTrustFund = async (id: Types.ObjectId) => {
    const { acknowledged } = await TrustFund.deleteOne({ _id: id })
    if (!acknowledged)
      throw new APIError("Failed to delete trust fund!", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default TrustFundRepository
