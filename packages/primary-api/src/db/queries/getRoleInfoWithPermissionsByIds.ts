import { getDB } from '../db'
import type { OrganizationRolePermissionTable } from '../models/OrganizationRolePermission'

export async function getRoleInfoWithPermissionsByIds (roleIds: string[]) {
  const db = await getDB()
  return db
    .selectFrom('organizationRole')
    .innerJoin('organizationRolePermission', 'organizationRole.id', 'organizationRolePermission.organizationRoleId')
    .select(eb => [
      'organizationRole.id',
      'organizationRole.name',
      'organizationRole.organizationId',
      eb.fn.agg<OrganizationRolePermissionTable['permission'][]>('array_agg', ['organizationRolePermission.permission']).as('permissions')
    ])
    .where('organizationRole.id', 'in', roleIds)
    .groupBy('organizationRole.id')
    .execute()
}
