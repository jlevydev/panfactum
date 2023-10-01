import type { SqlBool } from 'kysely'

import { dateToUnixSeconds } from './dateToUnixSeconds'

export interface IInput {
  // We really do want to be able to handle any inputs here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
export type Output<T extends IInput> = {[K in keyof T]: T[K] extends Array<IInput> ? Array<Output<T[K][number]>> : T[K] extends Date ? number : T[K] extends (Date | null) ? (number | null) : T[K] extends SqlBool ? boolean : T[K]}

// This function converts from the raw DB results to the response format acceptable to our fastify schemas
// In particular:
//  - converts Date objects to numbers representing seconds from the unix epoch
//  - does a Type conversion of SqlBool to boolean
export function getJSONFromDBResult<T extends IInput> (input: T): Output<T> {
  return Object.fromEntries(Object.entries(input).map(([key, val]) => {
    if (val === null) {
      return [key, val] as const
    } else if (Array.isArray(val)) {
      return [key, val.map(getJSONFromDBResult)] as const
    } else if (val instanceof Date) {
      return [key, dateToUnixSeconds(val)] as const
    } else if (typeof val === 'object') {
      return [key, getJSONFromDBResult(val)] as const
    } else {
      return [key, val] as const
    }
  })) as Output<T>
}
