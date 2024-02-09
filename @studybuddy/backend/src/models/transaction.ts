import { Schema, Types, model } from "mongoose"

export interface ITransaction {
  reference: string
  metadata: Record<string, unknown>
  amount?: number
  status: "PENDING" | "SUCCESS" | "FAILED"
  creatorId: Types.ObjectId
  createdAt: Date
}

const transactionSchema = new Schema<ITransaction>({
  reference: { type: String, required: true, unique: true },
  metadata: { type: String, required: true },
  amount: { type: Number, required: false },
  status: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, required: true },
})

export const Transaction = model<ITransaction>('Transaction', transactionSchema);

