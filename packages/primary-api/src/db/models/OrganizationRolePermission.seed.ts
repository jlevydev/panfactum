import { faker } from '@faker-js/faker'
import { getDB } from '../db'
import type { Selectable } from 'kysely'
import type { OrganizationRolePermissionTable } from './OrganizationRolePermission'
import type { OrganizationRoleTableSeed } from './OrganizationRole.seed'
import { sql } from 'kysely'

export type OrganizationRolePermissionTableSeed = Selectable<OrganizationRolePermissionTable>

const permissions = [
  'storefront',
  'package',
  'repository',
  'storefront_billing',
  'membership',
  'organization',
  'subscription',
  'subscription_billing'
]
  .map(resource => [`read:${resource}`, `write:${resource}`])
  .flat()
  .concat(['admin']) as OrganizationRolePermissionTable['permission'][]

export function createRandomOrganizationRolePermission (organizationRole: OrganizationRoleTableSeed): OrganizationRolePermissionTableSeed[] {
  return faker.helpers.arrayElements(permissions, { min: 5, max: permissions.length }).map(permission => ({
    id: faker.string.uuid(),
    organizationRoleId: organizationRole.id,
    permission
  }))
}

export async function seedOrganizationRolePermissionTable (organizationRoles: OrganizationRoleTableSeed[]) {
  const customRoles = organizationRoles.filter(role => role.organizationId !== null)
  const permissions = customRoles.map(createRandomOrganizationRolePermission).flat()
  await (await getDB()).insertInto('organizationRolePermission')
    .values(permissions)
    .execute()

  return permissions
}

export async function truncateOrganizationRolePermissionTable () {
  // Don't remove the default permissions
  await (await getDB())
    .deleteFrom('organizationRolePermission')
    .using('organizationRole')
    .where(({ eb, and }) => and([
      eb('organizationRolePermission.organizationRoleId', '=', sql.ref('organizationRole.id')),
      eb('organizationRole.organizationId', 'is not', null)
    ]))
    .execute()
}
