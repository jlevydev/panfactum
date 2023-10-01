import { getDB } from '../db'

export async function getPackageVersionInfoById (versionId: string) {
  const db = await getDB()
  return db
    .selectFrom('packageVersion')
    .select(eb => [
      'id',
      'archivedAt',
      'deletedAt',
      'packageId',
      eb('deletedAt', 'is not', null).as('isDeleted'),
      eb('archivedAt', 'is not', null).as('isArchived')
    ])
    .where('id', '=', versionId)
    .executeTakeFirst()
}
