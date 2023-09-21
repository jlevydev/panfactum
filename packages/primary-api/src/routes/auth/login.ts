import { Type, Static } from '@sinclair/typebox'

/**********************************************************************
 * Typings
 **********************************************************************/

export const LoginReply = Type.Object({
  userId: Type.String({ format: 'uuid' }),
  panfactumRole: Type.Union([Type.Null(), Type.String()]),
  loginSessionId: Type.String({ format: 'uuid' }),
  masqueradingUserId: Type.Optional(Type.String({ format: 'uuid' })),
  masqueradingPanfactumRole: Type.Optional(Type.Union([Type.Null(), Type.String()])),
  organizations: Type.Array(Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String({ minLength: 3 }),
    isUnitary: Type.Boolean()
  })),
  email: Type.String({ format: 'email' }),
  firstName: Type.String(),
  lastName: Type.String()
})
export type LoginReplyType = Static<typeof LoginReply>
