import { getDB } from '../db'

export async function getSimpleUserInfoById (userId: string) {
  const db = await getDB()
  return db
    .selectFrom('user')
    .select(eb => [
      eb('deletedAt', 'is not', null).as('isDeleted')
    ])
    .where('user.id', '=', userId)
    .executeTakeFirst()
}
