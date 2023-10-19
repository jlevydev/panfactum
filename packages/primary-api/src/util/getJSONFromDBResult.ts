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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return [key, [...val].map(getJSONFromAny)] as const
    } else if (val instanceof Date) {
      return [key, dateToUnixSeconds(val)] as const
    } else if (typeof val === 'object') {
      return [key, getJSONFromAny(val)] as const
    } else {
      return [key, val] as const
    }
  })) as Output<T>
}

// This is a bit hacky but we cannot do control flow type narrowing on type variables so we have to use
// function overloads: https://stackoverflow.com/questions/72339197/use-conditional-type-as-return-type-doesnt-work-correctly
export type InputAny = string | number | Date | IInput | boolean | null | Array<InputAny>
export type OutputAny<K extends InputAny> = K extends Date ? number : K extends (Date | null) ? (number | null) : K extends IInput ? Output<K> : K extends Array<InputAny> ? Array<OutputAny<K>> : K extends SqlBool ? boolean : K
export type OutputAnyAll = string | number | boolean | null | object
export function getJSONFromAny<K extends InputAny>(input: K): OutputAny<K>
export function getJSONFromAny (input: InputAny): OutputAnyAll {
  if (input === null) {
    return null
  } else if (Array.isArray(input)) {
    return input.map(getJSONFromAny)
  } else if (input instanceof Date) {
    return dateToUnixSeconds(input)
  } else if (typeof input === 'object') {
    return getJSONFromDBResult(input)
  } else {
    return input
  }
}
