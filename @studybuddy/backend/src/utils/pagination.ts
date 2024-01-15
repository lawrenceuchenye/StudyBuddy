import { z } from "zod"

namespace Pagination {
  export const schema = z.object({
    page: z.number().int().positive(),
    perPage: z.number().int().positive(),
  })

  export type Options = z.infer<typeof schema> & {
    total: number
  }

  export type QueryOptions = Omit<Options, "total">

  export type PaginatedResource<T> = {
    data: T[]
    meta: Options
  }

  export const createPaginatedResource = <T>(resource: T[], options: Options): PaginatedResource<T> => {
    return {
      data: resource,
      meta: options
    }
  }
}

export default Pagination
