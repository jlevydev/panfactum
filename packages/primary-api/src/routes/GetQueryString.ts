import type { Static, TSchema } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

import { StringEnum } from '../util/customTypes'

/**********************************************
 * Standard resource filtering options
 * ********************************************/

export enum FilterOperation {
  BOOLEAN = 'boolean',
  STR_EQ = 'strEq',
  NUM_EQ = 'numEq',
  SEARCH = 'search',
  NAME_SEARCH = 'nameSearch',
  BEFORE = 'before',
  AFTER = 'after',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte'
}

export type FilterSet = 'string' | 'date' | 'number' | 'boolean' | 'name' | undefined
export type FilterSetDefined = Exclude<FilterSet, undefined>
export type FilterConfig = {[name: string]: FilterSetDefined}

const FILTER_SETS: {[set in FilterSetDefined]: FilterOperation[]} = {
  name: [
    FilterOperation.NAME_SEARCH,
    FilterOperation.STR_EQ
  ],
  string: [
    FilterOperation.STR_EQ
  ],
  date: [
    FilterOperation.BEFORE,
    FilterOperation.AFTER
  ],
  number: [
    FilterOperation.NUM_EQ,
    FilterOperation.LT,
    FilterOperation.LTE,
    FilterOperation.GT,
    FilterOperation.GTE
  ],
  boolean: [
    FilterOperation.BOOLEAN
  ]
}

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

export function createFilterSchema (prop: string, op: FilterOperation) {
  if (op === FilterOperation.BOOLEAN) {
    return Type.Boolean({
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is true or false`
    })
  } else if (op === FilterOperation.STR_EQ) {
    return Type.String({
      minLength: 1,
      maxLength: 100,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property exactly matches the given string`
    })
  } else if (op === FilterOperation.SEARCH) {
    return Type.String({
      minLength: 1,
      maxLength: 100,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property matches a fuzzy search of the given string`
    })
  } else if (op === FilterOperation.NAME_SEARCH) {
    return Type.String({
      minLength: 1,
      maxLength: 100,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property matches a name search of the given string`
    })
  } else if (op === FilterOperation.NUM_EQ) {
    return Type.Integer({
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is equal to the given integer`
    })
  } else if (op === FilterOperation.LT) {
    return Type.Integer({
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is strictly less than the given integer`
    })
  } else if (op === FilterOperation.LTE) {
    return Type.Integer({
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is less than or equal to the given number`
    })
  } else if (op === FilterOperation.GT) {
    return Type.Integer({
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is strictly greater than the given number`
    })
  } else if (op === FilterOperation.GTE) {
    return Type.Integer({
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is greater than or equal to the given number`
    })
  } else if (op === FilterOperation.BEFORE) {
    return Type.Integer({
      minimum: 0,
      maximum: 3000000000,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is before the given date in unix seconds format`
    })
  } else if (op === FilterOperation.AFTER) {
    return Type.Integer({
      minimum: 0,
      maximum: 3000000000,
      description: `If provided, filter the results by whether the resource's \`${prop}\` property is after the given date in unix seconds format`
    })
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unable to create filter schema for unknown operation: ${op}`)
  }
}

export function createFilterParams (filters: FilterConfig = {}): {[prop: string]: TSchema} {
  return {
    ids: Type.Optional(Type.Array(Type.String({ format: 'uuid' }), { description: 'Return only objects with the indicated ids' })),
    ...(Object.fromEntries(Object.entries(filters).map(([k, v]) => {
      return FILTER_SETS[v].map(op => [`${k}_${op}`, Type.Optional(createFilterSchema(k, op))])
    }).flat()) as {[prop: string]: TSchema})
  }
}

export function createQueryString (filters: FilterConfig = {}, sortFields: ReturnType<typeof StringEnum> = StringEnum([], 'The field to sort by')) {
  return Type.Object({
    ...createFilterParams(filters),
    ...createSortParam(sortFields),
    ...Pagination
  })
}

export type GetFilters<T extends {[prop: string]: FilterSet}> = Partial<{
  [K in keyof T as T[K] extends 'boolean' ? `${string & K}_boolean` : never]: boolean
} & {
  [K in keyof T as T[K] extends 'string' | 'name' ? `${string & K}_strEq` : never]: string
}& {
  [K in keyof T as T[K] extends 'name' ? `${string & K}_nameSearch` : never]: string
} & {
  [K in keyof T as T[K] extends 'number' ? `${string & K}_numEq` : never]: number
} & {
  [K in keyof T as T[K] extends 'number' ? `${string & K}_gt` : never]: number
} & {
  [K in keyof T as T[K] extends 'number' ? `${string & K}_gte` : never]: number
} & {
  [K in keyof T as T[K] extends 'number' ? `${string & K}_lt` : never]: number
} & {
  [K in keyof T as T[K] extends 'number' ? `${string & K}_lte` : never]: number
} & {
  [K in keyof T as T[K] extends 'date' ? `${string & K}_before` : never]: number
} & {
  [K in keyof T as T[K] extends 'date' ? `${string & K}_after` : never]: number
}>

// Even though we use defaults, the type system will still show that some
// params are undefined unless we explicitly say that they will
// always be available
// S: An array of the sort fields
// F: An object of the possible filter values
export type GetQueryString<S extends ReturnType<typeof StringEnum>, F extends {[name: string]: FilterSet}> = {
  sortOrder: 'ASC' | 'DESC',
  page: number,
  perPage: number
  sortField?: Static<S>
  ids?: string[],
} & GetFilters<F>
