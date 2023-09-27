import type { FastifyRequest } from 'fastify'
import { UnauthenticatedError } from '../handlers/customErrors'

interface getAuthInfo {
  userId: string,
  loginSessionId: string,
  masqueradingUserId: string | null
}

export function getAuthInfo (req: FastifyRequest): getAuthInfo {
  const { userId, loginSessionId, masqueradingUserId } = req

  // If either of these are missing, that means
  // that the authentication cookie was not set (or was set improperly)
  if (!userId || !loginSessionId) {
    throw new UnauthenticatedError()
  }

  return { userId, loginSessionId, masqueradingUserId: masqueradingUserId || null }
}
