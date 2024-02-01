import { transformMongoId } from "@studybuddy/backend/utils/validator"
import { z } from "zod"

export const updateStudyGroupSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3),
  subjects: z.array(z.string().min(3)),
}).partial()

export const postStudyGroupMessageSchema = z.object({
  content: z.string(),
  mediaIds: z.array(z.string().transform(transformMongoId)),
})

export const updateStudyGroupMessageSchema = z.object({
  content: z.string().trim().min(1),
  mediaIds: z.array(z.string().transform(transformMongoId)).optional(),
}).partial()

