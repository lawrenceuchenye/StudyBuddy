import { Schema, model } from "mongoose"

export interface IAccountDetails {
  bankCode: number
  accountNumber: string
  createdAt: Date
}

const accountDetailsSchema = new Schema<IAccountDetails>({
  bankCode: { type: Number, required: true },
  accountNumber: { type: String, required: true },
  createdAt: { type: Date, required: true },
})

export const AcountDetails = model<IAccountDetails>('AccountDetails', accountDetailsSchema);

