import { getDB } from '../db'

export async function getUserByUnitaryOrgId (orgId: string) {
  const db = await getDB()
  return db
    .selectFrom('organization')
    .innerJoin('userOrganization', 'userOrganization.id', 'organization.id')
    .innerJoin('user', 'user.id', 'userOrganization.id')
    .select(eb => [
      'user.id',
      eb('user.deletedAt', 'is', null).as('isDeleted')
    ])
    .where('organization.id', '=', orgId)
    .executeTakeFirst()
}
