import type { FastifyRequest } from 'fastify'
import { LRUCache } from 'lru-cache'

import { getAuthInfo } from './getAuthInfo'
import { getDB } from '../db/db'
import type { OrganizationRolePermissionTable } from '../db/models/OrganizationRolePermission'
import { InsufficientOrganizationPrivileges } from '../handlers/customErrors'

const permissionsCache = new LRUCache<string, Set<OrganizationRolePermissionTable['permission']>>({

  // for use with tracking overall storage size
  maxSize: 50000,
  maxEntrySize: 25,
  sizeCalculation: (value) => {
    return value.size
  },

  // Permissions can last 5 minutes before refetching
  ttl: 1000 * 60 * 5,

  // return stale items before removing from cache?
  allowStale: true,

  updateAgeOnGet: false,
  updateAgeOnHas: false,
  fetchMethod: async (
    key
  ) => {
    const [userId, orgId] = key.split('.')
    if (userId === undefined || orgId === undefined) {
      throw new Error('Permissions cache broken because either userId or orgId was undefined in the fetcher.')
    }
    const db = await getDB()
    const permissions = await db
      .selectFrom('organizationRolePermission')
      .innerJoin('organizationRole', 'organizationRole.id', 'organizationRolePermission.organizationRoleId')
      .innerJoin('userOrganization', 'userOrganization.roleId', 'organizationRole.id')
      .select(['organizationRolePermission.permission as permission'])
      .where('userOrganization.userId', '=', userId)
      .where('userOrganization.organizationId', '=', orgId)
      .where('userOrganization.deletedAt', 'is', null)
      .execute()
    return new Set<OrganizationRolePermissionTable['permission']>(permissions.map(({ permission }) => permission))
  }
})

export interface OrgPermissionCheck {
  oneOf?: OrganizationRolePermissionTable['permission'][]
  allOf?:OrganizationRolePermissionTable['permission'][]
}
export async function assertUserHasOrgPermissions (req: FastifyRequest, orgId: string, check:OrgPermissionCheck): Promise<void> {
  const { userId } = getAuthInfo(req)

  const permissions = await permissionsCache.fetch(`${userId}.${orgId}`)

  if (!permissions || permissions.size === 0) {
    throw new InsufficientOrganizationPrivileges(`User ${userId} has no privileges in organization ${orgId} but tried to access a resource belonging to it.`)
  }

  for (const checkPermission of check.allOf ?? []) {
    if (!permissions.has(checkPermission)) {
      throw new InsufficientOrganizationPrivileges(`User ${userId} attempted to access a resource in organization ${orgId} without this required permission: ${checkPermission}.`)
    }
  }

  if (check.oneOf) {
    for (const checkPermission of check.oneOf ?? []) {
      if (permissions.has(checkPermission)) {
        return
      }
    }
    throw new InsufficientOrganizationPrivileges(`User ${userId} attempted to access a resource in organization ${orgId} without at least one of the required permissions: ${check.oneOf.join(', ')}`)
  }
}
