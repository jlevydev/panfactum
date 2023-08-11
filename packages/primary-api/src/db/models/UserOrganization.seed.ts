import type { UserTable } from './User'
import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { OrganizationTable } from './Organization'
import type { UserOrganizationTable } from './UserOrganization'

export function createRandomUserOrganization (users: UserTable[], organization:OrganizationTable[]): UserOrganizationTable {
  const user = faker.helpers.arrayElement(users)
  return {
    user_id: user.id,
    organization_id: faker.helpers.arrayElement(organization).id,
    role: faker.helpers.arrayElement(['admin', 'manager', 'viewer']),
    active: faker.datatype.number({ min: 0, max: 100 }) > 10,
    added_at: faker.date.future(1, user.added_at)
  }
}

export async function seedUserOrganizationTable (db: Kysely<Database>, users: UserTable[], organization:OrganizationTable[], count = 50) {
  faker.seed(123)
  const pkCache: Record<string, string[]> = {}
  const links = [...Array(count).keys()]
    .map(() => createRandomUserOrganization(users, organization))
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
  return links
}

export async function truncateUserOrganizationTable (db: Kysely<Database>) {
  await db.deleteFrom('user_organization')
    .execute()
}
