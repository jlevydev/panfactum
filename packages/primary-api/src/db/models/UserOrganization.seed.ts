import type { UserTable } from './User'
import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { OrganizationTable } from './Organization'
import type { UserOrganizationTable } from './UserOrganization'

export function createRandomUserOrganization (users: UserTable[], organizations:OrganizationTable[]): UserOrganizationTable {
  const user = faker.helpers.arrayElement(users)
  return {
    user_id: user.id,
    organization_id: faker.helpers.arrayElement(organizations).id,
    role: faker.helpers.arrayElement(['admin', 'manager', 'viewer']),
    active: faker.datatype.number({ min: 0, max: 100 }) > 10,
    added_at: faker.date.future(1, user.added_at)
  }
}

export function createUnitaryUserOrganization (user: UserTable, organizations:OrganizationTable[]): UserOrganizationTable {
  return {
    user_id: user.id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    organization_id: organizations.find(org => org.name === user.id)!.id,
    role: 'admin',
    active: true,
    added_at: user.added_at
  }
}

export async function seedUserOrganizationTable (db: Kysely<Database>, users: UserTable[], organizations:OrganizationTable[], count = 250) {
  faker.seed(123)

  // Seed the teams
  const pkCache: Record<string, string[]> = {}
  const nonUnitaryOrganizations = organizations.filter(org => !org.is_unitary)
  const links = [...Array(count).keys()]
    .map(() => createRandomUserOrganization(users, nonUnitaryOrganizations))
  // Removes the duplicate users in the org which would violate the PK constraint
    .filter((link) => {
      const usersInOrg = pkCache[link.organization_id] ?? []
      if (usersInOrg.includes(link.user_id)) {
        return false
      }
      pkCache[link.organization_id] = usersInOrg.concat([link.user_id])
      return true
    })
  await db.insertInto('user_organization')
    .values(links)
    .execute()

  // Seed the unitary organizations
  const unitaryOrganizationLinks = users.map((user) => createUnitaryUserOrganization(user, organizations))
  await db.insertInto('user_organization')
    .values(unitaryOrganizationLinks)
    .execute()

  return links.concat(unitaryOrganizationLinks)
}

export async function truncateUserOrganizationTable (db: Kysely<Database>) {
  await db.deleteFrom('user_organization')
    .execute()
}
