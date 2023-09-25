import { faker } from '@faker-js/faker'
import type { OrganizationTable } from './Organization'
import { getDB } from '../db'
import type { Selectable } from 'kysely'
import type { UserTableSeed } from './User.seed'

export type OrganizationTableSeed = Selectable<OrganizationTable>

export function createRandomOrganization (): OrganizationTableSeed {
  const createdAt = faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-01-01T00:00:00.000Z' })
  const deletedAt = faker.datatype.boolean(0.95) ? null : faker.date.future({ years: 1, refDate: createdAt })
  const updatedAt = deletedAt === null
    ? faker.date.soon({ days: 100, refDate: createdAt })
    : faker.date.between({ from: createdAt, to: deletedAt })
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    isUnitary: false, // these are the team organizations
    createdAt,
    deletedAt,
    updatedAt
  }
}

export function createUnitaryOrganization (user: UserTableSeed): OrganizationTableSeed {
  const createdAt = user.createdAt
  const deletedAt = user.deletedAt
  const updatedAt = deletedAt === null
    ? faker.date.soon({ days: 100, refDate: createdAt })
    : faker.date.between({ from: createdAt, to: deletedAt })
  return {
    id: faker.string.uuid(),
    name: user.id,
    isUnitary: true,
    createdAt,
    deletedAt,
    updatedAt
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

export async function seedOrganizationTableUnitary (users: UserTableSeed[]) {
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
