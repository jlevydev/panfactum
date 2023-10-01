import type { FastifyPluginAsync } from 'fastify'

import { GetOrganizationMemberships } from './get'
import { UpdateOrganizationMembershipsRoutes } from './update'

export const OrganizationMembershipsRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetOrganizationMemberships)
  await fastify.register(UpdateOrganizationMembershipsRoutes)
}
