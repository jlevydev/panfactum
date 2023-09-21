import type { UserTable } from './User'
import { faker } from '@faker-js/faker'
import type { OrganizationTable } from './Organization'
import type { UserOrganizationTable } from './UserOrganization'
import { getDB } from '../db'

export function createRandomUserOrganization (users: UserTable[], organization:OrganizationTable): UserOrganizationTable {
  const user = faker.helpers.arrayElement(users)
  return {
    userId: user.id,
    organizationId: organization.id,
    role: faker.helpers.arrayElement(['admin', 'manager', 'viewer']),
    active: faker.number.int({ min: 0, max: 100 }) > 10,
    createdAt: faker.date.future({ years: 1, refDate: user.createdAt })
  }
}

export function createUnitaryUserOrganization (user: UserTable, organizations:OrganizationTable[]): UserOrganizationTable {
  return {
    userId: user.id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    organizationId: organizations.find(org => org.name === user.id)!.id,
    role: 'admin',
    active: true,
    createdAt: user.createdAt
  }
}

export async function seedUserOrganizationTable (users: UserTable[], organizations:OrganizationTable[], maxPerOrg = 20) {
  // Seed the teams
  const pkCache: Record<string, string[]> = {}
  const teamOrgs = organizations.filter(org => !org.isUnitary)
  const links = teamOrgs.map(org => {
    return [...Array(faker.number.int({ min: 1, max: maxPerOrg })).keys()]
      .map(() => createRandomUserOrganization(users, org))
      // Removes the duplicate users in the org which would violate the PK constraint
      .filter((link) => {
        const usersInOrg = pkCache[link.organizationId] ?? []
        if (usersInOrg.includes(link.userId)) {
          return false
        }
        pkCache[link.organizationId] = usersInOrg.concat([link.userId])
        return true
      })
  }).flat()

  await (await getDB()).insertInto('userOrganization')
    .values(links)
    .execute()

  return links
}

export async function seedUserOrganizationTableUnitary (users: UserTable[], organizations:OrganizationTable[]) {
  // Seed the unitary organizations
  const unitaryOrganizationLinks = users.map((user) => createUnitaryUserOrganization(user, organizations))
  await (await getDB()).insertInto('userOrganization')
    .values(unitaryOrganizationLinks)
    .execute()

  return unitaryOrganizationLinks
}

export async function truncateUserOrganizationTable () {
  await (await getDB()).deleteFrom('userOrganization')
    .execute()
}
