export type PaginationOptions = {
  page: number
  perPage: number
  total: number
}

export type PaginationQueryOptions = Omit<PaginationOptions, "total">

type PaginatedResponse<T> = {
  data: T
  meta: PaginationOptions
}

export const createPaginatedResource = <T extends {}>(resource: T, options: PaginationOptions): PaginatedResponse<T> => {
  return {
    data: resource,
    meta: {
      page: options.page,
      perPage: options.perPage,
      total: options.total,
    }
  }
}
