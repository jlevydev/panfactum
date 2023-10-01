import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

import {
  OrganizationIsUnitary,
  OrganizationName,
  OrganizationPermission,
  OrganizationRoleId,
  OrganizationRoleName
} from './organization'
import { UserEmail, UserFirstName, UserLastName } from './user'
import { StringEnum } from '../../util/customTypes'

// Basic auth types
export const AuthUserId = Type.String({ format: 'uuid', description: 'The unique identifier for the logged in user.' })
export const AuthPanfactumRole = Type.Union([
  Type.Null(),
  StringEnum(['admin'], 'The role of a Panfactum employee')
], { description: 'If not `null`, then this user is a Panfactum employee, and this is their role.' })
export const AuthMasqueradingUserId = Type.String({ format: 'uuid', description: 'When a Panfactum employee is masquerading as another user, this is their real user id.' })
export const AuthMasqueradingPanfactumRole = StringEnum(['admin'], 'The role of the Panfactum employee')

// Login session info
export const AuthLoginSessionId = Type.String({ format: 'uuid', description: 'A unique identifier for this login session. Represents a particular instance of an authentication cookie.' })
export const AuthLoginSessionCreatedAt = Type.Integer({ minimum: 0, description: 'When the session was initiated. Unix timestamp in seconds.' })
export const AuthLoginSessionLastApiCallAt = Type.Union([
  Type.Integer({ minimum: 0, description: 'When the last API call was made using the sessions auth cookie. Unix timestamp in seconds.' }),
  Type.Null()
], { description: 'If `null`, the user has not made any API calls yet in this session' })

// The standard login payload returned by several authentication routes
export const LoginReply = Type.Object({
  userId: AuthUserId,
  panfactumRole: AuthPanfactumRole,
  loginSessionId: AuthLoginSessionId,
  masqueradingUserId: Type.Optional(AuthMasqueradingUserId),
  masqueradingPanfactumRole: Type.Optional(AuthMasqueradingPanfactumRole),
  organizations: Type.Array(Type.Object({
    id: OrganizationName,
    name: OrganizationName,
    roleName: OrganizationRoleName,
    roleId: OrganizationRoleId,
    permissions: Type.Array(OrganizationPermission, {
      description: "The list of all of the user's permissions with the organization"
    }),
    isUnitary: OrganizationIsUnitary
  }), { description: 'A list of all of the organizations that the user is a member of' }),
  email: UserEmail,
  firstName: UserFirstName,
  lastName: UserLastName
})
export type LoginReplyType = Static<typeof LoginReply>
