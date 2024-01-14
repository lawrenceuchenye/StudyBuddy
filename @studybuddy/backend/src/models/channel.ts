import { Schema, Types, model } from 'mongoose';

export interface IChannel {
  name: string
  creatorId: Types.ObjectId
  messageIds: Types.ObjectId[]
  moderatorIds: Types.ObjectId[]
  createdAt: Date
}

export interface IChannelMessage {
  content: string
  mediaIds: Types.ObjectId[]
  senderId: Types.ObjectId
  channelId: Types.ObjectId
  sentAt: Date
}

export interface IChannelMedia {
  data: string
  type: string
  size: number
}

type ChannelUserRole = "CREATOR" | "MODERATOR" | "MEMBER" | "POSTER" | "READER"
export interface IChannelUser {
  userId: Types.ObjectId
  roles: ChannelUserRole[]
  joinedAt: Date
}

const channelUserSchema = new Schema<IChannelUser>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roles: { type: [String], required: true },
  joinedAt: { type: Date, required: true },
});

export const ChannelUser = model<IChannelUser>('ChannelUser', channelUserSchema);

const channelMediaSchema = new Schema<IChannelMedia>({
  data: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
})

export const ChannelMedia = model<IChannelMedia>('ChannelMedia', channelMediaSchema);

const channelMessageSchema = new Schema<IChannelMessage>({
  content: { type: String, required: true },
  mediaIds: { type: [Schema.Types.ObjectId], ref: "ChannelMedia", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "ChannelUser", required: true },
  channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
  sentAt: { type: Date, required: true },
});

export const ChannelMessage = model<IChannelMessage>('ChannelMessage', channelMessageSchema);

const channelSchema = new Schema<IChannel>({
  name: { type: String, required: true },
  messageIds: { type: [Schema.Types.ObjectId], ref: "ChannelMessage", required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "ChannelUser", required: true },
  moderatorIds: { type: [Schema.Types.ObjectId], ref: "ChannelUser", required: true },
  createdAt: { type: Date, required: true },
});

export const Channel = model<IChannel>('Channel', channelSchema);