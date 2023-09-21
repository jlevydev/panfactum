import { faker } from '@faker-js/faker'
import type { OrganizationTable } from './Organization'
import type { UserTable } from './User'
import { getDB } from '../db'

export function createRandomOrganization (): OrganizationTable {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    isUnitary: false, // these are the team organizations
    createdAt: faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-01-01T00:00:00.000Z' })
  }
}

export function createUnitaryOrganization (user: UserTable): OrganizationTable {
  return {
    id: faker.string.uuid(),
    name: user.id,
    isUnitary: true,
    createdAt: user.createdAt
  }
}

export async function seedOrganizationTable (count = 50) {
  // Create the team organizations
  const organizations = [...Array(count).keys()].map(() => createRandomOrganization())
  await (await getDB()).insertInto('organization')
    .values(organizations)
    .execute()

  return organizations
}

export async function seedOrganizationTableUnitary (users: UserTable[]) {
  // Create the unitary organizations
  const unitaryOrganizations = users.map(createUnitaryOrganization)
  await (await getDB()).insertInto('organization')
    .values(unitaryOrganizations)
    .execute()

  return unitaryOrganizations
}

export async function truncateOrganizationTable () {
  await (await getDB()).deleteFrom('organization')
    .execute()
}
