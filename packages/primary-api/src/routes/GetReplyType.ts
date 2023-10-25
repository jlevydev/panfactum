import type { TSchema } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

export function getReplyType<T extends TSchema> (record: T) {
  return Type.Object({
    data: Type.Array(record),
    pageInfo: Type.Object({
      hasNextPage: Type.Boolean(),
      hasPreviousPage: Type.Boolean()
    })
  })
}
