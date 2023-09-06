import type { FastifyPluginAsync } from 'fastify'
import { HealthzRoute } from './healthz'

export const HealthRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/healthz'
  await fastify.register(HealthzRoute, { prefix })
}
