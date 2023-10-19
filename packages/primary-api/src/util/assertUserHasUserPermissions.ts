import type { FastifyRequest } from 'fastify'

import { getAuthInfo } from './getAuthInfo'
import { CrossUserAccessError } from '../handlers/customErrors'

export async function assertUserHasUserPermissions (req: FastifyRequest, checkUserId: string): Promise<void> {
  const { userId } = getAuthInfo(req)
  if (userId !== checkUserId) {
    throw new CrossUserAccessError(`User ${userId} cannot access resources belonging to another user ${userId}`)
  }
}
