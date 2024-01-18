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
