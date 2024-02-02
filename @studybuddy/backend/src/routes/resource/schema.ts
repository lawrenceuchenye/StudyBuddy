import { transformMongoId } from "@studybuddy/backend/utils/validator"
import { z } from "zod"

export const createResourceSchema = z.object({
  title: z.string().min(3),
  shortDescription: z.string().min(3),
  longDescription: z.string().min(3),
  subjects: z.array(z.string().min(3)),
  mediaIds: z.array(z.string().transform(transformMongoId)),
})

export const updateResourceSchema = createResourceSchema.partial()
