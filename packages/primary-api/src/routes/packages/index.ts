import type { FastifyPluginAsync } from 'fastify'

import { GetPackagesRoute } from './get'
import { UpdatePackagesRoute } from './update'

export const PackagesRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetPackagesRoute)
  await fastify.register(UpdatePackagesRoute)
}
