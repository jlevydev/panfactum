import { getDB } from '../db'

export async function getOrgInfoById (orgId: string) {
  const db = await getDB()
  return db
    .selectFrom('organization')
    .select(eb => [
      'organization.id',
      'organization.isUnitary',
      eb('deletedAt', 'is not', null).as('isDeleted')
    ])
    .where('organization.id', '=', orgId)
    .executeTakeFirst()
}
