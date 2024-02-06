import { Schema, Types, model } from "mongoose"

export interface IPost {
  title: string
  tags: string[]
  content: string
  isPublished: boolean
  publishedAt?: Date | null
  authorId: Types.ObjectId
  createdAt: Date
  updatedAt?: Date | null
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  tags: { type: [String], required: true },
  content: { type: String, required: true },
  isPublished: { type: Boolean, required: true },
  publishedAt: { type: Date, required: false, default: null },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true, default: null },
})

export const Post = model<IPost>('Post', postSchema);

