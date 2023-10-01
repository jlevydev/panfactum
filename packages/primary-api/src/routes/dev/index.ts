import type { FastifyPluginAsync } from 'fastify'

import { RedoMigrateRoute } from './redo-migrate'
import { SeedRoute } from './seed'
import { ThrowErrorRoute } from './throwError'

export const DevRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/dev'
  await fastify.register(SeedRoute, { prefix })
  await fastify.register(RedoMigrateRoute, { prefix })
  await fastify.register(ThrowErrorRoute, { prefix })
}
