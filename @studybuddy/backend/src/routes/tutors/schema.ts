import Pagination from '@studybuddy/backend/utils/pagination'
import { transformMongoId } from '@studybuddy/backend/utils/validator'
import { z } from 'zod'

export const createTutorSchema = z.object({
  name: z.string(),
  trustFundId: z.string().transform(transformMongoId).nullable().default(null)
})

export const getTutorSchema = z.object({
  id: z.string().transform(transformMongoId)
})

export const findTutorSchema = Pagination
  .schema
  .extend({
    name: z.string().optional()
  })

export const updateTutorSchema = createTutorSchema.partial()

