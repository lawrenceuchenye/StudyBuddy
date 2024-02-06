import { Schema, Types, model } from "mongoose"

export interface ITrustFund {
  name: string
  shortDescription: string
  longDescription: string
  balance: number
  logoId: Types.ObjectId
  creatorId: Types.ObjectId
  accountDetails: {
    bankCode: string
    number: string
    recipientId?: string
  },
  createdAt: Date
}

const trustFundSchema = new Schema<ITrustFund>({
  name: { type: String, required: true },
  shortDescription: { type: String, required: true },
  longDescription: { type: String, required: true },
  balance: { type: Number, required: true },
  logoId: { type: Schema.Types.ObjectId, ref: "Media", required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  accountDetails: {
    type: {
      bankCode: String,
      number: String,
      recipientId: { type: String, required: false }
    },
    required: true
  },
  createdAt: { type: Date, required: true },
})

export const TrustFund = model<ITrustFund>('TrustFund', trustFundSchema);

