import type { UserTable } from './User'
import { faker } from '@faker-js/faker'
import { createPasswordHash, createPasswordSalt } from '../../util/password'
import { getDB } from '../db'

export function createDevAdminUser (): UserTable {
  const salt = createPasswordSalt()
  const hash = createPasswordHash('password', salt)
  return {
    id: faker.string.uuid(),
    email: 'dev@panfactum.com',
    firstName: 'Panfactum',
    lastName: 'Developer',
    createdAt: faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-01-01T00:00:00.000Z' }),
    passwordHash: hash,
    passwordSalt: salt,
    panfactumRole: 'admin'
  }
}

export function createRandomUser (emailCache: Set<string>): UserTable {
  let email = faker.internet.email().toLowerCase()
  while (emailCache.has(email)) {
    email = faker.internet.email().toLowerCase()
  }
  emailCache.add(email)

  const salt = createPasswordSalt()
  const hash = createPasswordHash('password', salt)
  return {
    id: faker.string.uuid(),
    email,
    firstName: faker.person.firstName(),
    lastName: faker.person.firstName(),
    createdAt: faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-01-01T00:00:00.000Z' }),
    passwordHash: hash,
    passwordSalt: salt,
    panfactumRole: null
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
