import { getDB } from '../db'

export async function getAdminRoleInfo () {
  const db = await getDB()
  return db
    .selectFrom('organizationRole')
    .select([
      'organizationRole.id',
      'organizationRole.name'
    ])
    .where('organizationRole.name', '=', 'Administrator')
    .where('organizationRole.organizationId', 'is', null)
    .executeTakeFirst()
}
