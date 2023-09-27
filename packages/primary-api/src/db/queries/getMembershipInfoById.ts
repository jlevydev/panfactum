import { getDB } from '../db'

export async function getMembershipInfoById (membershipId: string) {
  const db = await getDB()
  return db
    .selectFrom('userOrganization')
    .innerJoin('organizationRole', 'organizationRole.id', 'userOrganization.roleId')
    .select(eb => [
      'userOrganization.userId as userId',
      'userOrganization.organizationId as orgId',
      'organizationRole.id as roleId',
      'organizationRole.name as roleName',
      eb('userOrganization.deletedAt', 'is not', null).as('isDeleted')
    ])
    .where('userOrganization.id', '=', membershipId)
    .executeTakeFirst()
}
