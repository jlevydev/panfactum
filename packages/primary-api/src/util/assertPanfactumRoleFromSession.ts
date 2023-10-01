import type { FastifyRequest } from 'fastify'

import { getPanfactumRoleFromSession } from './getPanfactumRoleFromSession'
import type { UserTable } from '../db/models/User'
import { WrongPanfactumRoleError } from '../handlers/customErrors'

type PanfactumRole = UserTable['panfactumRole']

export async function assertPanfactumRoleFromSession (req: FastifyRequest, role: PanfactumRole) {
  const userRole = await getPanfactumRoleFromSession(req)

  if (userRole !== role) {
    throw new WrongPanfactumRoleError(role, userRole)
  }
}
