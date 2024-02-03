import { Schema, model } from "mongoose"

export interface IMedia {
  name: string
  data: Buffer
  type: string
  size: number
  uploadedAt: Date
}

const mediaSchema = new Schema<IMedia>({
  name: { type: String, required: true },
  data: { type: Buffer, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, required: true },
})

export const Media = model<IMedia>('Media', mediaSchema);

