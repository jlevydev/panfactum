import { faker } from '@faker-js/faker'
import type { UserOrganizationTable } from './UserOrganization'
import { getDB } from '../db'
import type { Selectable } from 'kysely'
import type { OrganizationTableSeed } from './Organization.seed'
import type { UserTableSeed } from './User.seed'
import type { OrganizationRoleTableSeed } from './OrganizationRole.seed'

export type UserOrganizationTableSeed = Selectable<UserOrganizationTable>

export function createRandomUserOrganization (users: UserTableSeed[], organization:OrganizationTableSeed, standardRoleIds: string[], orgRoles: OrganizationRoleTableSeed[]): UserOrganizationTableSeed {
  const user = faker.helpers.arrayElement(users)
  let deletedAt: Date | null
  let createdAt: Date
  if (user.deletedAt === null) {
    createdAt = faker.date.between({ from: user.createdAt, to: Date() })
    deletedAt = faker.datatype.boolean(0.90) ? null : faker.date.between({ from: createdAt, to: Date() })
  } else {
    createdAt = faker.date.between({ from: user.createdAt, to: user.deletedAt })
    deletedAt = faker.datatype.boolean(0.90) ? null : faker.date.between({ from: createdAt, to: user.deletedAt })
  }

  return {
    id: faker.string.uuid(),
    userId: user.id,
    organizationId: organization.id,
    roleId: (orgRoles.length === 0 || faker.datatype.boolean(0.75)) ? faker.helpers.arrayElement(standardRoleIds) : faker.helpers.arrayElement(orgRoles).id,
    createdAt,
    deletedAt
  }
}

export function createUnitaryUserOrganization (user: UserTableSeed, organizations:OrganizationTableSeed[], adminRoleId: string): UserOrganizationTableSeed {
  return {
    id: faker.string.uuid(),
    userId: user.id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    organizationId: organizations.find(org => org.name === user.id)!.id,
    roleId: adminRoleId,
    createdAt: user.createdAt,
    deletedAt: null // Can never break the bond between a user and their unitary organization
  }
}

export async function seedUserOrganizationTable (users: UserTableSeed[], organizations:OrganizationTableSeed[], roles: OrganizationRoleTableSeed[], maxPerOrg = 20) {
  const adminRoleId = await getAdminRoleId()

  const standardRoleIds = (await (await getDB())
    .selectFrom('organizationRole')
    .select(['id'])
    .where('organizationRole.organizationId', 'is', null)
    .execute()
  ).map(({ id }) => id)

  const pkCache: Record<string, string[]> = {}
  const teamOrgs = organizations.filter(org => !org.isUnitary)
  const links = teamOrgs.map(org => {
    const orgRoles = roles.filter(role => role.organizationId === org.id)

    // Ensures there is at least one admin user per org
    const adminUser = [createRandomUserOrganization(users, org, [adminRoleId], [])]

    return adminUser
      .concat([...Array(faker.number.int({ min: 1, max: maxPerOrg })).keys()]
        .map(() => createRandomUserOrganization(users, org, standardRoleIds, orgRoles))
      )
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

export async function seedUserOrganizationTableUnitary (users: UserTableSeed[], organizations:OrganizationTableSeed[]) {
  const adminRoleId = await getAdminRoleId()

  const unitaryOrganizationLinks = users.map((user) => createUnitaryUserOrganization(user, organizations, adminRoleId))
  await (await getDB()).insertInto('userOrganization')
    .values(unitaryOrganizationLinks)
    .execute()

  return unitaryOrganizationLinks
}

async function getAdminRoleId () {
  const { id: adminRoleId } = await (await getDB())
    .selectFrom('organizationRole')
    .select(['id'])
    .where(({ eb, and }) => and([
      eb('organizationRole.organizationId', 'is', null),
      eb('organizationRole.name', '=', 'Administrator')
    ]))
    .executeTakeFirstOrThrow()
  return adminRoleId
}

export async function truncateUserOrganizationTable () {
  await (await getDB()).deleteFrom('userOrganization')
    .execute()
}
