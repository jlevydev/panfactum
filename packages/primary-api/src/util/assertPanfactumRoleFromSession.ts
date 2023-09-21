import type { FastifyRequest } from 'fastify'
import type { UserTable } from '../db/models/User'
import { getPanfactumRoleFromSession } from './getPanfactumRoleFromSession'

type PanfactumRole = UserTable['panfactumRole']

export class WrongPanfactumRoleError extends Error {
  constructor (requiredRole: PanfactumRole, foundRole: PanfactumRole) {
    super(`Unauthorized: Wrong panfactum role. Got ${foundRole}. Required ${requiredRole}.`)
  }
}

export async function assertPanfactumRoleFromSession (req: FastifyRequest, role: PanfactumRole) {
  const userRole = await getPanfactumRoleFromSession(req)

  if (userRole !== role) {
    throw new WrongPanfactumRoleError(role, userRole)
  }
}
