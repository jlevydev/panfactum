import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { OrganizationTable } from './Organization'

export function createRandomOrganization (): OrganizationTable {
  return {
    id: faker.datatype.uuid(),
    name: faker.company.name()
  }
}

export async function seedOrganizationTable (db: Kysely<Database>, count = 50) {
  faker.seed(123)
  const organizations = [...Array(count).keys()].map(() => createRandomOrganization())
  await db.insertInto('organization')
    .values(organizations)
    .execute()
  return organizations
}

export async function truncateOrganizationTable (db: Kysely<Database>) {
  await db.deleteFrom('organization')
    .execute()
}
