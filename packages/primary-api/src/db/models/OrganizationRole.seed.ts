import { faker } from '@faker-js/faker'
import type { Selectable } from 'kysely'

import type { OrganizationTableSeed } from './Organization.seed'
import type { OrganizationRoleTable } from './OrganizationRole'
import { getDB } from '../db'

export type OrganizationRoleTableSeed = Selectable<OrganizationRoleTable>

export function createRandomOrganizationRole (organization: OrganizationTableSeed, nameCache: Set<string>): OrganizationRoleTableSeed {
  let name = faker.person.jobType()
  while (nameCache.has(name)) {
    name = faker.person.jobType()
  }
  nameCache.add(name)
  const createdAt = faker.date.soon({ refDate: organization.createdAt, days: 100 })
  return {
    id: faker.string.uuid(),
    organizationId: organization.id,
    name,
    description: faker.word.words({ count: { min: 5, max: 20 } }),
    createdAt,
    updatedAt: faker.date.soon({ refDate: createdAt, days: 100 })
  }
}

export async function seedOrganizationRoleTable (organizations: OrganizationTableSeed[], maxPerOrg = 5) {
  const nonUnitaryOrgs = organizations.filter(org => !org.isUnitary)
  const roles = nonUnitaryOrgs.map((org) => {
    const count = faker.number.int({ min: 0, max: maxPerOrg })
    const nameCache: Set<string> = new Set()
    return count > 0 ? [...Array(count).keys()].map(() => createRandomOrganizationRole(org, nameCache)) : []
  }).flat()
  await (await getDB()).insertInto('organizationRole')
    .values(roles)
    .execute()

  return roles
}

export async function truncateOrganizationRoleTable () {
  // Don't delete the standard roles
  await (await getDB()).deleteFrom('organizationRole')
    .where('organizationRole.organizationId', 'is not', null)
    .execute()
}
