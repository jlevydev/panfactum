import type { FastifyPluginAsync } from 'fastify'

import { AuthInfoRoute } from './info'
import { LoginByMasquerade } from './loginByMasquerade'
import { AuthLoginByPasswordRoute } from './loginByPassword'
import { LoginByUndoMasquerade } from './loginByUndoMasquerade'
import { AuthLogoutRoute } from './logout'

export const AuthRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/auth'
  await fastify.register(AuthInfoRoute, { prefix })
  await fastify.register(AuthLogoutRoute, { prefix })
  await fastify.register(AuthLoginByPasswordRoute, { prefix })
  await fastify.register(LoginByMasquerade, { prefix })
  await fastify.register(LoginByUndoMasquerade, { prefix })
}
