import { getDB } from '../db'
import type { OrganizationRolePermissionTable } from '../models/OrganizationRolePermission'

export async function getRoleInfoByIds (ids: string[], config: {
  withPermissions?: boolean,
  withActiveAssigneeCount?: boolean,
  excludeGlobal?: boolean
} = {}) {
  const { withPermissions = false, withActiveAssigneeCount = false, excludeGlobal = false } = config
  const db = await getDB()
  return db
    .selectFrom('organizationRole')
    .select(['organizationRole.id', 'organizationRole.name', 'organizationRole.organizationId'])
    .$if(withPermissions, qb => qb
      .innerJoin('organizationRolePermission', 'organizationRole.id', 'organizationRolePermission.organizationRoleId')
      .select(eb => [
        eb.fn.agg<OrganizationRolePermissionTable['permission'][]>('array_agg', ['organizationRolePermission.permission']).as('permissions')
      ])
      .groupBy('organizationRole.id')
    )
    .$if(withActiveAssigneeCount, qb => qb
      .leftJoin('userOrganization', 'organizationRole.id', 'userOrganization.roleId')
      .select(eb => [
        eb.fn.count<number>('userOrganization.id').distinct()
          .filterWhere('userOrganization.deletedAt', 'is', null)
          .as('activeAssigneeCount')
      ])
      .groupBy('organizationRole.id')
    )
    .where('organizationRole.id', 'in', ids)
    .$if(excludeGlobal, qb => qb.where('organizationRole.organizationId', 'is not', null))
    .execute()
}
