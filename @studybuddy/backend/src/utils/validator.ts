import { Types } from 'mongoose'
import { z } from "zod"

export const transformMongoId = (value: string, ctx: z.RefinementCtx) => {
  if (!Types.ObjectId.isValid(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid id",
    });
    return z.NEVER
  }
  return new Types.ObjectId(value)
}

export const fileSchema = z.custom<File>(val => {
  const schema = z.object({
    type: z.string(),
    name: z.string(),
    size: z.number(),
    lastModified: z.number()
  })

  if (schema.safeParse(val).success)
    return val as File
})
  .transform((file) => file as unknown as File)
