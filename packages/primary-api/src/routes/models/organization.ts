import { Type } from '@sinclair/typebox'
import { StringEnum } from '../../util/customTypes'

export const OrganizationId = Type.String({ format: 'uuid', description: 'Unique identifier for the organization' })
export const OrganizationRoleId = Type.String({ format: 'uuid', description: "Unique identifier for the user's role within the organization" })
export const OrganizationRoleName = Type.String({ minLength: 1, description: "Display name for the user's role within the organization" })
export const OrganizationRoleOrganizationId = Type.Union([
  Type.Null(),
  OrganizationId
], { description: 'If `null`, the role is available to ALL organizations. Otherwise, it is scoped to the indicated organization.' })
export const OrganizationRoleAssigneeCount = Type.Integer({
  minimum: 0,
  description: 'Number of active users assigned this role. Scoped to the `organizationId` filter (if supplied).'
})
export const OrganizationMembershipCreatedAt = Type.Integer({
  minimum: 0,
  description: 'When the user was added to the organization. Unix timestamp in seconds.'
})
export const OrganizationMembershipId = Type.String({
  format: 'uuid',
  description: 'Unique identifier for this organization membership'
})
export const OrganizationMembershipDeletedAt = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Null()
], { description: 'When the user was removed from the organization. Unix timestamp in seconds. `null` if not deleted.' })
export const OrganizationMembershipIsDeleted = Type.Boolean({
  description: 'True iff the organization membership was rescinded. Derived from `deletedAt.'
})
export const OrganizationName = Type.String({ minLength: 1, description: 'The display name of the organization' })
export const OrganizationIsUnitary = Type.Boolean({ description: "True iff this is a user's personal organization. If so, the organization name will be set to the user's id." })
export const OrganizationCreatedAt = Type.Integer({
  minimum: 0,
  description: 'When the organization was created. Unix timestamp in seconds.'
})
export const OrganizationDeletedAt = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Null()
], { description: 'When the organization was deleted. Unix timestamp in seconds. `null` if not deleted.' })
export const OrganizationUpdatedAt = Type.Integer({
  minimum: 0,
  description: 'When an organization property was updated. Unix timestamp in seconds.'
})
export const OrganizationIsDeleted = Type.Boolean({
  description: 'True if the organization has been deleted. Derived from deletedAt.'
})
export const OrganizationActiveMemberCount = Type.Integer({
  minimum: 1,
  description: 'The number of active memberships in the organization.'
})
export const OrganizationActivePackageCount = Type.Integer({
  minimum: 0,
  description: 'The number of active packages in the organization.'
})
export const OrganizationPermission = StringEnum([
  'write:storefront',
  'read:storefront',
  'write:package',
  'read:package',
  'write:repository',
  'read:repository',
  'write:storefront_billing',
  'read:storefront_billing',
  'write:membership',
  'read:membership',
  'write:organization',
  'read:organization',
  'write:subscription',
  'read:subscription',
  'write:subscription_billing',
  'read:subscription_billing',
  'admin'
], "A permission to interact with an organization's resources")
export const OrganizationRolePermissions = Type.Array(OrganizationPermission, {
  description: 'A list of the permissions assigned to the given role.'
})
