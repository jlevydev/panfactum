import { getDB } from '../db'

export async function getAllRoleNamesByOrgId (orgId: string): Promise<string[]> {
  const db = await getDB()
  const names = await db.selectFrom('organizationRole')
    .select(['name'])
    .where('organizationRole.organizationId', '=', orgId)
    .execute()

  return names.map(({ name }) => name)
}
