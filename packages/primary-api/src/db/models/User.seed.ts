import type { UserTable } from './User'
import { faker } from '@faker-js/faker'
import { createPasswordHash, createPasswordSalt } from '../../util/password'
import { getDB } from '../db'
import type { Selectable } from 'kysely'

export type UserTableSeed = Selectable<UserTable>

export function createDevAdminUser (): UserTableSeed {
  const salt = createPasswordSalt()
  const hash = createPasswordHash('password', salt)
  const createdAt = faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-01-01T00:00:00.000Z' })
  return {
    id: faker.string.uuid(),
    email: 'dev@panfactum.com',
    firstName: 'Panfactum',
    lastName: 'Developer',
    createdAt,
    updatedAt: createdAt,
    passwordHash: hash,
    passwordSalt: salt,
    panfactumRole: 'admin',
    deletedAt: null
  }
}

export function createRandomUser (emailCache: Set<string>): UserTableSeed {
  let email = faker.internet.email().toLowerCase()
  while (emailCache.has(email)) {
    email = faker.internet.email().toLowerCase()
  }
  emailCache.add(email)

  const salt = createPasswordSalt()
  const hash = createPasswordHash('password', salt)
  const createdAt = faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-01-01T00:00:00.000Z' })
  const deletedAt = faker.datatype.boolean(0.95) ? null : faker.date.future({ years: 1, refDate: createdAt })
  const updatedAt = deletedAt === null
    ? faker.date.soon({ days: 100, refDate: createdAt })
    : faker.date.between({ from: createdAt, to: deletedAt })
  return {
    id: faker.string.uuid(),
    email,
    firstName: faker.person.firstName(),
    lastName: faker.person.firstName(),
    createdAt,
    passwordHash: hash,
    passwordSalt: salt,
    panfactumRole: null,
    deletedAt,
    updatedAt
  }
}

export async function seedUserTable (count = 50) {
  const emailCache: Set<string> = new Set()
  const users = [...Array(count).keys()]
    .map(() => createRandomUser(emailCache))
    .concat([createDevAdminUser()])
  await (await getDB()).insertInto('user')
    .values(users)
    .execute()
  return users
}

export async function truncateUserTable () {
  await (await getDB()).deleteFrom('user')
    .execute()
}
