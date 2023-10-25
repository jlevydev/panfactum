import type { FastifyPluginAsync } from 'fastify'

import { DeleteOrganizationRolesRoute } from './delete'
import { GetOrganizationRolesRoute } from './get'
import { UpdateOrganizationRolesRoute } from './update'

export const OrganizationRolesRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetOrganizationRolesRoute)
  await fastify.register(UpdateOrganizationRolesRoute)
  await fastify.register(DeleteOrganizationRolesRoute)
}
