import type { FastifyRequest } from 'fastify'

import { getAuthInfo } from './getAuthInfo'
import { CrossUserAccess } from '../handlers/customErrors'

export async function assertUserHasUserPermissions (req: FastifyRequest, checkUserId: string): Promise<void> {
  const { userId } = getAuthInfo(req)
  if (userId !== checkUserId) {
    throw new CrossUserAccess(`User ${userId} cannot access resources belonging to another user ${userId}`)
  }
}
