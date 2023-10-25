import type { OrgPermissionCheck } from '../../util/assertUserHasOrgPermissions'

// Roles cannot have these names in create/update calls
export const restrictedRoleNames = new Set(['Administrator', 'User', 'Publisher', 'Billing Manager', 'Organization Manager'])

// The required permissions for creating/updating/deleting roles without the admin permission
export const requiredPermissions = { allOf: ['write:membership'] } as OrgPermissionCheck

// The required permissions for creating/updating/deleting roles with the admin permission
export const requiredPermissionsWithAdmin = { allOf: ['write:membership', 'admin'] } as OrgPermissionCheck
