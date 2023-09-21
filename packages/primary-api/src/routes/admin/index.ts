import type { FastifyPluginAsync } from 'fastify'
import { GetUsersRoute } from './users/get'

export const AdminRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/admin'
  await fastify.register(GetUsersRoute, { prefix })
}
