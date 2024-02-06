import { Schema, Types, model } from "mongoose"

export interface ITutorProfile {
  name: string
  trustFundId: Types.ObjectId | null
  joinedAt: Date
}

const tutorProfileSchema = new Schema<ITutorProfile>({
  name: { type: String, required: true },
  trustFundId: { type: Schema.Types.ObjectId, ref: "TrustFund", required: false, default: null },
  joinedAt: { type: Date, required: true },
})

export const TutorProfile = model<ITutorProfile>('TutorProfile', tutorProfileSchema);

