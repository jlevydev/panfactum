import type { FastifyRequest } from 'fastify'
import type { UserOrganizationTable } from '../db/models/UserOrganization'

type OrgRoles = UserOrganizationTable['role']

export class UserNotInOrgError extends Error {
  constructor (userId: string, orgId: string) {
    super(`Unauthorized: User ${userId} not in org ${orgId}`)
  }
}

export class UserOrgRoleNotAuthorizedError extends Error {
  constructor (userId: string, orgId: string, authorizedRoles: string[]) {
    super(`Unauthorized: User ${userId} in org ${orgId} does not have an authorized role: ${JSON.stringify(authorizedRoles)}`)
  }
}

// TODO: Finish
export async function assertUserInOrgWithRole (_req: FastifyRequest, _orgId: string, _allowedRoles?: OrgRoles[]) {
  // const userRole = await getPanfactumRoleFromSession(req)

  // if (userRole !== role) {
  //   throw new WrongPanfactumRoleError(role, userRole)
  // }
}
