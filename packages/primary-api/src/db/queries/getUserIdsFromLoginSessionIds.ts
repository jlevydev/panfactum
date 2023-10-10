import { getDB } from '../db'

export async function getUserIdsFromLoginSessionIds (sessionIds: string[]) {
  const db = await getDB()
  const ids = await db.selectFrom('userLoginSession')
    .select(['userLoginSession.userId as userId'])
    .where('userLoginSession.id', 'in', sessionIds)
    .execute()

  return ids.map(({ userId }) => userId)
}
