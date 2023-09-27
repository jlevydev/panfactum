import type { FastifyRequest } from 'fastify'
import type { UserTable } from '../db/models/User'
import { getPanfactumRoleFromSession } from './getPanfactumRoleFromSession'
import { WrongPanfactumRoleError } from '../handlers/customErrors'

type PanfactumRole = UserTable['panfactumRole']

export async function assertPanfactumRoleFromSession (req: FastifyRequest, role: PanfactumRole) {
  const userRole = await getPanfactumRoleFromSession(req)

  if (userRole !== role) {
    throw new WrongPanfactumRoleError(role, userRole)
  }
}
