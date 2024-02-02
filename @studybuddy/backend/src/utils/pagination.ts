import { z } from "zod"

namespace Pagination {
  export const schema = z.object({
    page: z.coerce.number()
      .int({ message: "Invalid page number" })
      .positive({ message: "Invalid page number" })
      .default(1),
    perPage: z.coerce.number()
      .int({ message: "Invalid per page number" })
      .positive({ message: "Invalid per page number" })
      .default(10),
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

  export type SingleResource<T> = {
    data: T
  }

  export const createSingleResource = <T>(resource: T): SingleResource<T> => {
    return {
      data: resource,
    }
  }
}

export default Pagination
