import { getDB } from '../db'

export async function getPackageInfoById (packageId: string) {
  const db = await getDB()
  return db
    .selectFrom('package')
    .select(eb => [
      'id',
      'archivedAt',
      'deletedAt',
      'organizationId',
      eb('deletedAt', 'is not', null).as('isDeleted'),
      eb('archivedAt', 'is not', null).as('isArchived')
    ])
    .where('id', '=', packageId)
    .executeTakeFirst()
}
