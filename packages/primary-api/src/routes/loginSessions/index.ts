import type { FastifyPluginAsync } from 'fastify'

import { GetLoginSessions } from './get'

export const LoginSessionsRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetLoginSessions)
}
