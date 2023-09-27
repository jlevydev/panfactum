import { getDB } from '../db'

// Returns all of the other memberships in the same
// organization for a given membership id who have a given role
export async function getActiveSiblingMembershipsWithRole (membershipId: string, roleName: string) {
  const db = await getDB()
  return db
    .with(
      'org',
      eb => eb.selectFrom('organization')
        .select(['organization.id as id'])
        .innerJoin('userOrganization', 'userOrganization.organizationId', 'organization.id')
        .where('userOrganization.id', '=', membershipId)
    )
    .selectFrom('userOrganization')
    .innerJoin('org', 'org.id', 'userOrganization.organizationId')
    .innerJoin('organizationRole', 'organizationRole.id', 'userOrganization.roleId')
    .select([
      'userOrganization.id as membershipId',
      'organizationRole.id as roleId',
      'organizationRole.name as roleName'
    ])
    .where('userOrganization.deletedAt', 'is', null)
    .where('userOrganization.id', '!=', membershipId)
    .where('organizationRole.name', '=', roleName)
    .execute()
}
