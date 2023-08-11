import type { UserTable } from './User'
import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import { createPasswordHash, createPasswordSalt } from '../../util/password'

export function createRandomUser (): UserTable {
  const email = faker.internet.email().toLowerCase()
  const salt = createPasswordSalt()
  const hash = createPasswordHash('password', salt)
  return {
    id: faker.datatype.uuid(),
    email,
    first_name: faker.name.firstName(),
    last_name: faker.name.firstName(),
    added_at: faker.date.between('2020-01-01T00:00:00.000Z', '2023-01-01T00:00:00.000Z'),
    password_hash: hash,
    password_salt: salt
  }
}

export async function seedUserTable (db: Kysely<Database>, count = 50) {
  faker.seed(123)
  const users = [...Array(count).keys()].map(() => createRandomUser())
  await db.insertInto('user')
    .values(users)
    .execute()
  return users
}

export async function truncateUserTable (db: Kysely<Database>) {
  await db.deleteFrom('user')
    .execute()
}
