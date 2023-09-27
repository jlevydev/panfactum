import { getDB } from '../db'

export async function getRoleInfoById (roleId: string) {
  const db = await getDB()
  return db
    .selectFrom('organizationRole')
    .select(['organizationRole.name', 'organizationRole.organizationId'])
    .where('organizationRole.id', '=', roleId)
    .executeTakeFirst()
}
