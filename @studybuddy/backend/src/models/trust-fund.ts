import { Schema, Types, model } from "mongoose"

export interface ITrustFund {
  name: string
  shortDescription: string
  longDescription: string
  balance: number
  logoId: Types.ObjectId
  creatorId: Types.ObjectId
  accountDetailsId: Types.ObjectId
  createdAt: Date
}

const trustFundSchema = new Schema<ITrustFund>({
  name: { type: String, required: true },
  shortDescription: { type: String, required: true },
  longDescription: { type: String, required: true },
  balance: { type: Number, required: true },
  logoId: { type: Schema.Types.ObjectId, ref: "Media", required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  accountDetailsId: { type: Schema.Types.ObjectId, ref: "AccountDetails", required: true },
  createdAt: { type: Date, required: true },
})

export const TrustFund = model<ITrustFund>('TrustFund', trustFundSchema);

