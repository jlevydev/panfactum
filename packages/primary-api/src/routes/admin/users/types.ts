import { Static, Type } from '@sinclair/typebox'

export const User = Type.Object({
  id: Type.String({ format: 'uuid' }),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String(),
  numberOfOrgs: Type.Number({
    minimum: 1,
    description: 'The number of organizations the user is a member of'
  }),
  createdAt: Type.Integer({ description: 'Unix timestamp in seconds' })
})

export type UserType = Static<typeof User>
