import { Static, TSchema, Type } from '@sinclair/typebox'
import { StringEnum } from '../util/customTypes'

/**********************************************
 * Provides a standard format to our resource queries
 * which allows them to confirm to the FE data provider spec
 * ********************************************/

export const Pagination = {
  page: Type.Optional(Type.Integer({ minimum: 0, default: 0, description: 'Page for pagination' })),
  perPage: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 25, description: 'Number of results per page' }))
}

export function createSortParam (sortFields: ReturnType<typeof StringEnum> = StringEnum([], 'The field to sort by')) {
  return {
    sortField: Type.Optional(sortFields),
    sortOrder: Type.Optional(StringEnum(['ASC', 'DESC'], 'DESC'))
  }
}

export function createFilterParam (filters: {[name: string]: TSchema} = {}) {
  return {
    ids: Type.Optional(Type.Array(Type.String({ format: 'uuid' }), { description: 'Return only objects with the indicated ids' })),
    ...Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, Type.Optional(v)]))
  }
}

export function createQueryString (filters: {[name: string]: TSchema} = {}, sortFields: ReturnType<typeof StringEnum> = StringEnum([], 'The field to sort by')) {
  return Type.Object({
    ...createFilterParam(filters),
    ...createSortParam(sortFields),
    ...Pagination
  })
}

// Even though we use defaults, the type system will still show that some
// params are undefined unless we explicitly say that they will
// always be available
// S: An array of the sort fields
// F: An object of the possible filter values
export type GetQueryString<S extends ReturnType<typeof StringEnum>, F extends {[name: string]: TSchema}> = {
  sortOrder: 'ASC' | 'DESC',
  page: number,
  perPage: number
  sortField: Static<S>
  ids?: string[],
} & Partial<{[prop in keyof F]: Static<F[prop]>}>

export function createGetReplyType<T extends TSchema> (record: T) {
  return Type.Object({
    data: Type.Array(record),
    pageInfo: Type.Object({
      hasNextPage: Type.Boolean(),
      hasPreviousPage: Type.Boolean()
    })
  })
}

// Necessary for converting between the data provider provided sort
// orders and what kysely expects while still maintaining type checking
export function convertSortOrder (input: 'ASC' | 'DESC'): 'asc' | 'desc' {
  if (input === 'ASC') {
    return 'asc'
  } else {
    return 'desc'
  }
}
