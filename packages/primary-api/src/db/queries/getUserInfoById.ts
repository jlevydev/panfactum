import { getDB } from '../db'
import { jsonArrayFrom } from 'kysely/helpers/postgres'
import type { OrganizationRolePermissionTable } from '../models/OrganizationRolePermission'

export async function getUserInfoById (id: string) {
  const db = await getDB()

  return db
    .selectFrom('user')
    .select(eb => [
      'user.id',
      'user.panfactumRole',
      'user.firstName',
      'user.lastName',
      'user.email',
      jsonArrayFrom(
        eb.selectFrom('organization')
          .innerJoin('userOrganization', 'organization.id', 'userOrganization.organizationId')
          .innerJoin('organizationRole', 'userOrganization.roleId', 'organizationRole.id')
          .innerJoin('user', 'user.id', 'userOrganization.userId')
          .innerJoin('organizationRolePermission', 'organizationRole.id', 'organizationRolePermission.organizationRoleId')
          .select(eb => [
            'organization.id as id',
            'organization.name as name',
            'organization.isUnitary as isUnitary',
            'userOrganization.roleId as roleId',
            'organizationRole.name as roleName',
            eb.fn.agg<OrganizationRolePermissionTable['permission'][]>('array_agg', ['organizationRolePermission.permission']).as('permissions')
          ])
          .where('user.id', '=', id)
          .groupBy([
            'organization.id',
            'organization.name',
            'organization.isUnitary',
            'userOrganization.roleId',
            'organizationRole.name'
          ])
      ).as('organizations')
    ])
    .where('user.id', '=', id)
    .executeTakeFirstOrThrow()
}
