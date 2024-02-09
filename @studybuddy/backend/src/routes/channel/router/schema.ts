import { transformMongoId } from "@studybuddy/backend/utils/validator"
import { z } from "zod"

export const updateChannelSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3),
  subjects: z.array(z.string().min(3)),
}).partial()

export const updateChannelMemberSchema = z.object({
  trustFundId: z.string().transform(transformMongoId)
    .nullable()
    .default(null),
})

export const postChannelMessageSchema = z.object({
  content: z.string(),
  mediaIds: z.array(z.string().transform(transformMongoId)),
})

export const updateChannelMessageSchema = z.object({
  content: z.string().trim().min(1),
  mediaIds: z.array(z.string().transform(transformMongoId)).optional(),
}).partial()

