import type { FastifyPluginAsync } from 'fastify'
import { UserOrganizationsRoute } from './organizations'

export const UserRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/user'
  await fastify.register(UserOrganizationsRoute, { prefix })
}
