import type { TSchema } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

export function deleteQueryString<T extends TSchema> (IdType: T) {
  return Type.Object({
    ids: Type.Array(IdType)
  }, { additionalProperties: false })
}
