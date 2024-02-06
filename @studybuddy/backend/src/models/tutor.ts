import { Schema, Types, model } from "mongoose"

export interface ITutor {
  name: string
  trustFundId: Types.ObjectId | null
  joinedAt: Date
}

const tutorSchema = new Schema<ITutor>({
  name: { type: String, required: true },
  trustFundId: { type: Schema.Types.ObjectId, ref: "TrustFund", required: false, default: null },
  joinedAt: { type: Date, required: true },
})

export const Tutor = model<ITutor>('Tutor', tutorSchema);

