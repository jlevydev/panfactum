import { faker } from '@faker-js/faker'
import type { UserLoginSession } from './UserLoginSession'
import type { UserTable } from './User'
import { getDB } from '../db'

export function createRandomUserLoginSession (users: UserTable[]): UserLoginSession {
  const user = faker.helpers.arrayElement(users)
  const createdAt = faker.date.future({ years: 2, refDate: user.createdAt })
  return {
    id: faker.string.uuid(),
    userId: user.id,
    masqueradingUserId: null,
    createdAt,
    lastApiCallAt: faker.date.soon({ days: 1, refDate: createdAt })
  }
}

export async function seedUserLoginSessionTable (users: UserTable[], count = 200) {
  let runningSessionCount = 0
  while (runningSessionCount < count) {
    const nextBatchSessions = Math.min(10000, count - runningSessionCount)
    const sessions = [...Array(nextBatchSessions).keys()].map(() => {
      return createRandomUserLoginSession(users)
    })
    await (await getDB()).insertInto('userLoginSession')
      .values(sessions)
      .execute()
    runningSessionCount += nextBatchSessions
  }
}

export async function truncateLoginSessionTable () {
  await (await getDB()).deleteFrom('userLoginSession')
    .execute()
}
