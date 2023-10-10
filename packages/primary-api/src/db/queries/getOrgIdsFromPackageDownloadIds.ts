import { getDB } from '../db'

export async function getOrgIdsFromPackageDownloadIds (downloadIds: string[]) {
  const db = await getDB()
  const ids = await db.selectFrom('package')
    .innerJoin('packageVersion', 'packageVersion.packageId', 'package.id')
    .innerJoin('packageDownload', 'packageDownload.versionId', 'packageVersion.id')
    .select(['package.organizationId as orgId'])
    .where('packageDownload.id', 'in', downloadIds)
    .execute()

  return ids
    .map(({ orgId }) => orgId)
    .filter((id): id is string => id !== null)
}
