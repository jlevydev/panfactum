import { getDB } from '../db'

export async function getOrgRoleInfoById (roleId: string) {
  const db = await getDB()
  return db
    .selectFrom('organizationRole')
    .select([
      'id',
      'name'
    ])
    .where('id', '=', roleId)
    .executeTakeFirst()
}
