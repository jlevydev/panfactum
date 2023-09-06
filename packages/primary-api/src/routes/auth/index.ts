import type { FastifyPluginAsync } from 'fastify'
import { AuthInfoRoute } from './info'
import { AuthLogoutRoute } from './logout'
import { AuthLoginRoute } from './login'

export const AuthRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/auth'
  await fastify.register(AuthInfoRoute, { prefix })
  await fastify.register(AuthLogoutRoute, { prefix })
  await fastify.register(AuthLoginRoute, { prefix })
}
