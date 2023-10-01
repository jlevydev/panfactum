import type { FastifyPluginAsync } from 'fastify'

import { GetOrganizationRolesRoute } from './get'
import { UpdateOrganizationRolesRoute } from './update'

export const OrganizationRolesRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetOrganizationRolesRoute)
  await fastify.register(UpdateOrganizationRolesRoute)
}
