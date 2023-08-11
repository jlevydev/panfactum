
import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { UserLoginSession } from './UserLoginSession'
import type { UserTable } from './User'

export function createRandomUserLoginSession (users: UserTable[]): UserLoginSession {
  const user = faker.helpers.arrayElement(users)
  const started_at = faker.date.future(2, user.added_at)
  return {
    id: faker.datatype.uuid(),
    user_id: user.id,
    started_at,
    last_api_call_at: faker.date.soon(1, started_at)
  }
}

export async function seedUserLoginSessionTable (db: Kysely<Database>, users: UserTable[], count = 200) {
  faker.seed(123)
  const sessions = [...Array(count).keys()].map(() => createRandomUserLoginSession(users))
  await db.insertInto('user_login_session')
    .values(sessions)
    .execute()
  return sessions
}

export async function truncateLoginSessionTable (db: Kysely<Database>) {
  await db.deleteFrom('user_login_session')
    .execute()
}
