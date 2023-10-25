import type { FastifyPluginAsync } from 'fastify'

import { CreateOrganizationRolesRoute } from './create'
import { DeleteOrganizationRolesRoute } from './delete'
import { GetOrganizationRolesRoute } from './get'
import { UpdateOrganizationRolesRoute } from './update'

export const OrganizationRolesRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetOrganizationRolesRoute)
  await fastify.register(UpdateOrganizationRolesRoute)
  await fastify.register(DeleteOrganizationRolesRoute)
  await fastify.register(CreateOrganizationRolesRoute)
}
