import Pagination from '@studybuddy/backend/utils/pagination'
import { transformMongoId } from '@studybuddy/backend/utils/validator'
import { z } from 'zod'

export const createTutorProfileSchema = z.object({
  name: z.string(),
  trustFundId: z.string().transform(transformMongoId).nullable().default(null)
})

export const getTutorProfileSchema = z.object({
  id: z.string().transform(transformMongoId)
})

export const findTutorProfileSchema = Pagination
  .schema
  .extend({
    name: z.string().optional()
  })

export const updateTutorProfileSchema = createTutorProfileSchema.partial()

