import { Schema, Types, model } from 'mongoose';

export interface IResource {
  title: string
  shortDescription: string
  longDescription: string
  subjects: string[]
  mediaIds: Types.ObjectId[]
  creatorId: Types.ObjectId
  createdAt: Date
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  longDescription: { type: String, required: true },
  subjects: { type: [String], required: true },
  mediaIds: { type: [Schema.Types.ObjectId], ref: "Media" },
  creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, required: true },
});

export const Resource = model<IResource>('Resource', resourceSchema);
