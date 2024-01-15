namespace Pagination {
  export type Options = {
    page: number
    perPage: number
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
