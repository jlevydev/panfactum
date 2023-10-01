import type { FastifyPluginAsync } from 'fastify'

import { GetOrganizationsRoute } from './get'
import { UpdateOrganizationsRoute } from './update'

export const OrganizationsRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetOrganizationsRoute)
  await fastify.register(UpdateOrganizationsRoute)
}
