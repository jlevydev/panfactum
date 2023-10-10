import { getDB } from '../db'

export async function getOrgIdsFromOrgMembershipIds (membershipIds: string[]) {
  const db = await getDB()
  const ids = await db.selectFrom('userOrganization')
    .select(['userOrganization.organizationId as orgId'])
    .where('userOrganization.id', 'in', membershipIds)
    .execute()

  return ids
    .map(({ orgId }) => orgId)
    .filter((id): id is string => id !== null)
}
