import type { FastifyRequest } from 'fastify'
import { LRUCache } from 'lru-cache'

import { getAuthInfo } from './getAuthInfo'
import { getDB } from '../db/db'
import type { UserTable } from '../db/models/User'

const roleCache = new LRUCache<string, NonNullable<UserTable['panfactumRole']>>({

  // for use with tracking overall storage size
  max: 1000,

  // Roles can be cached for up to 5 minutes before refetching
  ttl: 1000 * 60 * 5,

  // return stale items before removing from cache?
  allowStale: true,

  updateAgeOnGet: false,
  updateAgeOnHas: false,
  fetchMethod: async (
    key
  ) => {
    const db = await getDB()

    const user = await db
      .selectFrom('user')
      .select(['panfactumRole'])
      .where('id', '=', key)
      .executeTakeFirst()

    if (!user) {
      return undefined
    } else {
      return user.panfactumRole ?? undefined
    }
  }
})

export async function getPanfactumRoleFromSession (req: FastifyRequest) {
  const { userId } = getAuthInfo(req)
  const role = await roleCache.fetch(userId)
  return role ?? null
}
