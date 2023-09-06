import type { FastifyRequest } from 'fastify'

export class UnauthenticatedError extends Error {
  constructor () {
    super('Not authenticated')
  }
}

interface IGetLoginInfoReturnValue {
  userId: string,
  loginSessionId: string
}

export function getLoginInfo (req: FastifyRequest): IGetLoginInfoReturnValue {
  const { userId, loginSessionId } = req

  // If either of these are missing, that means
  // that the authentication cookie was not set (or was set improperly)
  if (!userId || !loginSessionId) {
    throw new UnauthenticatedError()
  }
  return { userId, loginSessionId }
}
