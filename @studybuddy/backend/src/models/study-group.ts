import { Schema, Types, model } from 'mongoose';

export interface IStudyGroup {
  name: string
  description: string
  subjects: string[]
  creatorId: Types.ObjectId
  createdAt: Date
}

export interface IStudyGroupMessage {
  content: string
  mediaIds: Types.ObjectId[]
  senderId: Types.ObjectId
  studyGroupId: Types.ObjectId
  deleted: boolean
  sentAt: Date
}

export interface IStudyGroupMedia {
  data: string
  type: string
  size: number
  uploadedAt: Date
}

export interface IStudyGroupJoinRequest {
  userId: Types.ObjectId,
  studyGroupId: Types.ObjectId
  dateSent: Date
}

export type StudyGroupUserRole = "CREATOR" | null

export interface IStudyGroupUser {
  studyGroupId: Types.ObjectId
  role: StudyGroupUserRole
  joinedAt: Date
}

const studyGroupUserSchema = new Schema<IStudyGroupUser>({
  studyGroupId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: false, default: null },
  joinedAt: { type: Date, required: true },
});

export const StudyGroupUser = model<IStudyGroupUser>('StudyGroupUser', studyGroupUserSchema);

const studyGroupMediaSchema = new Schema<IStudyGroupMedia>({
  data: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, required: true, default: Date.now() },
})

export const StudyGroupMedia = model<IStudyGroupMedia>('StudyGroupMedia', studyGroupMediaSchema);

const studyGroupJoinRequestSchema = new Schema<IStudyGroupJoinRequest>({
  userId: { type: Schema.Types.ObjectId, required: true },
  studyGroupId: { type: Schema.Types.ObjectId, required: true }
})

export const studyGroupJoinRequest = model<IStudyGroupJoinRequest>("studyGroupJoinRequest", studyGroupJoinRequestSchema)

const studyGroupMessageSchema = new Schema<IStudyGroupMessage>({
  content: { type: String, required: true },
  mediaIds: { type: [Schema.Types.ObjectId], ref: "StudyGroupMedia", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "StudyGroupUser", required: true },
  studyGroupId: { type: Schema.Types.ObjectId, ref: "StudyGroup", required: true },
  sentAt: { type: Date, required: true },
});

export const StudyGroupMessage = model<IStudyGroupMessage>('StudyGroupMessage', studyGroupMessageSchema);

const studyGroupSchema = new Schema<IStudyGroup>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subjects: { type: [String], required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "StudyGroupUser", required: true },
  createdAt: { type: Date, required: true },
});

export const StudyGroup = model<IStudyGroup>('StudyGroup', studyGroupSchema);
