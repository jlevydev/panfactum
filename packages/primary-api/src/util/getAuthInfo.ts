import type { FastifyRequest } from 'fastify'

import { Errors, UnauthenticatedError } from '../handlers/customErrors'

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
    throw new UnauthenticatedError('Unable to identity user. Auth cookie missing.', Errors.NotAuthenticatedMissingCookie)
  }

  return { userId, loginSessionId, masqueradingUserId: masqueradingUserId || null }
}
