import { Static, Type } from '@sinclair/typebox'

export const OrgParams = Type.Object({
  orgId: Type.String({ format: 'uuid' })
})

export type OrgParamsType = Static<typeof OrgParams>
