import { getDB } from '../db'

export async function getOrgIdsFromPackageVersionIds (versionIds: string[]) {
  const db = await getDB()
  const ids = await db.selectFrom('package')
    .innerJoin('packageVersion', 'packageVersion.packageId', 'package.id')
    .select(['package.organizationId as orgId'])
    .where('packageVersion.id', 'in', versionIds)
    .execute()

  return ids
    .map(({ orgId }) => orgId)
    .filter((id): id is string => id !== null)
}
