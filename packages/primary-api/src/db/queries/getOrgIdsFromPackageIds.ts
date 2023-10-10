import { getDB } from '../db'

export async function getOrgIdsFromPackageIds (packageIds: string[]) {
  const db = await getDB()
  const ids = await db.selectFrom('package')
    .select(['package.organizationId as orgId'])
    .where('package.id', 'in', packageIds)
    .execute()

  return ids
    .map(({ orgId }) => orgId)
    .filter((id): id is string => id !== null)
}
