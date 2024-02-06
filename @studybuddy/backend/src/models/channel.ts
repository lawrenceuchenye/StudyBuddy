import { Schema, Types, model } from 'mongoose';

export interface IChannel {
  name: string
  description: string
  subjects: string[]
  creatorId: Types.ObjectId
  createdAt: Date
}

export interface IChannelMessage {
  content: string
  mediaIds: Types.ObjectId[]
  senderId: Types.ObjectId
  channelId: Types.ObjectId
  deleted: boolean
  sentAt: Date
}

export type ChannelMemberRole = "CREATOR" | "TUTOR" | null

export interface IChannelMember {
  channelId: Types.ObjectId
  role: ChannelMemberRole
  trustFundId?: Types.ObjectId | null
  joinedAt: Date
}

const channelMemberSchema = new Schema<IChannelMember>({
  channelId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: false, default: null },
  trustFundId: { type: Schema.Types.ObjectId, ref: "TrustFund", required: false },
  joinedAt: { type: Date, required: true },
});

export const ChannelMember = model<IChannelMember>('ChannelMember', channelMemberSchema);

const channelMessageSchema = new Schema<IChannelMessage>({
  content: { type: String, required: true },
  mediaIds: { type: [Schema.Types.ObjectId], ref: "Media", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "ChannelMember", required: true },
  channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
  sentAt: { type: Date, required: true },
});

export const ChannelMessage = model<IChannelMessage>('ChannelMessage', channelMessageSchema);

const channelSchema = new Schema<IChannel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subjects: { type: [String], required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "ChannelMember", required: true },
  createdAt: { type: Date, required: true },
});

export const Channel = model<IChannel>('Channel', channelSchema);
