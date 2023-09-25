import { faker } from '@faker-js/faker'
import type { UserLoginSession } from './UserLoginSession'
import { getDB } from '../db'
import type { UserTableSeed } from './User.seed'

export function createRandomUserLoginSession (users: UserTableSeed[]): UserLoginSession {
  const user = faker.helpers.arrayElement(users)
  const createdAt = user.deletedAt !== null
    ? faker.date.between({ from: user.createdAt, to: user.deletedAt })
    : faker.date.future({ years: 2, refDate: user.createdAt })
  return {
    id: faker.string.uuid(),
    userId: user.id,
    masqueradingUserId: null,
    createdAt,
    lastApiCallAt: faker.date.soon({ days: 1, refDate: createdAt })
  }
}

export async function seedUserLoginSessionTable (users: UserTableSeed[], count = 200) {
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
