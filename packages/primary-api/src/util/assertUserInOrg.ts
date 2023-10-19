import type { FastifyRequest } from 'fastify'

import { getAuthInfo } from './getAuthInfo'
import { getDB } from '../db/db'
import { InsufficientOrganizationPrivilegesError } from '../handlers/customErrors'

export async function assertUserInOrg (req: FastifyRequest, orgId: string): Promise<void> {
  const { userId } = getAuthInfo(req)

  const db = await getDB()
  const inOrg = await db
    .selectFrom('userOrganization')
    .select(['id'])
    .where('userOrganization.userId', '=', userId)
    .where('userOrganization.organizationId', '=', orgId)
    .where('userOrganization.deletedAt', 'is', null)
    .executeTakeFirst()

  if (inOrg === undefined) {
    throw new InsufficientOrganizationPrivilegesError(`User ${userId} is not in organization ${orgId} so it cannot access it's resources`)
  }
}
