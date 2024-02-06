import { Types } from "mongoose"
import { ITransaction, Transaction } from "../models/transaction"
import { APIError } from "../utils/error"
import { StatusCodes } from "http-status-codes"

namespace TransactionRepository {
  type CreateTransactionPayload = Omit<ITransaction, "createdAt" | "status">

  export const createTransaction = async (payload: CreateTransactionPayload) => {
    return Transaction.create({
      ...payload,
      status: "PENDING",
      createdAt: new Date()
    })
  }

  export const getTransaction = async (id: Types.ObjectId) => {
    return await Transaction.findById(id)
  }

  export const updateTransaction = async (id: Types.ObjectId, payload: Partial<ITransaction>) => {
    const { acknowledged } = await Transaction.updateOne(
      { _id: id },
      payload
    )
    if (!acknowledged)
      throw new APIError("Failed to update transaction!", { code: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export default TransactionRepository
