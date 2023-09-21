import type { FastifyRequest } from 'fastify'
import { getAuthInfo } from './getAuthInfo'
import { getDB } from '../db/db'

export async function getPanfactumRoleFromSession (req: FastifyRequest) {
  const { userId, masqueradingUserId } = getAuthInfo(req)
  const db = await getDB()

  const user = await db
    .selectFrom('user')
    .select(['panfactumRole'])
    .where('id', '=', masqueradingUserId ?? userId)
    .executeTakeFirstOrThrow()

  return user.panfactumRole
}
