import { getDB } from '../db'

export async function getOrgIdsFromOrgRoleIds (roleIds: string[]) {
  const db = await getDB()
  const ids = await db.selectFrom('organizationRole')
    .select(['organizationRole.organizationId as orgId'])
    .where('organizationRole.id', 'in', roleIds)
    .execute()

  return ids
    .map(({ orgId }) => orgId)
    .filter((id): id is string => id !== null)
}
