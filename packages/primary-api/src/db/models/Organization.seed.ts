import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { OrganizationTable } from './Organization'
import type { UserTable } from './User'

export function createRandomOrganization (): OrganizationTable {
  return {
    id: faker.datatype.uuid(),
    name: faker.company.name(),
    is_unitary: false // these are the team organizations
  }
}

export function createUnitaryOrganization (user: UserTable) {
  return {
    id: faker.datatype.uuid(),
    name: user.id,
    is_unitary: true
  }
}

export async function seedOrganizationTable (db: Kysely<Database>, users: UserTable[], count = 50) {
  faker.seed(123)

  // Create the unitary organizations
  const unitaryOrganizations = users.map(createUnitaryOrganization)
  await db.insertInto('organization')
    .values(unitaryOrganizations)
    .execute()

  // Create the team organizations
  const organizations = [...Array(count).keys()].map(() => createRandomOrganization())
  await db.insertInto('organization')
    .values(organizations)
    .execute()

  return organizations.concat(unitaryOrganizations)
}

export async function truncateOrganizationTable (db: Kysely<Database>) {
  await db.deleteFrom('organization')
    .execute()
}
