import { getDB } from '../db'

// Returns all of a user's active memberships where they have a given role
// Exclude unitary orgs
export async function getAllActiveMembershipsWithRoleByUserId (userId: string, roleName: string) {
  const db = await getDB()
  return db
    .selectFrom('userOrganization')
    .innerJoin('organizationRole', 'organizationRole.id', 'userOrganization.roleId')
    .innerJoin('organization', 'userOrganization.organizationId', 'organization.id')
    .select([
      'userOrganization.id as membershipId',
      'organizationRole.id as roleId',
      'organizationRole.name as roleName',
      'organization.id as organizationId',
      'organization.name as organizationName'
    ])
    .where('userOrganization.deletedAt', 'is', null)
    .where('userOrganization.userId', '=', userId)
    .where('organizationRole.name', '=', roleName)
    .where('organization.isUnitary', '=', false)
    .execute()
}
