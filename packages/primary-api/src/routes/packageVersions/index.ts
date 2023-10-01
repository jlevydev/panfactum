import type { FastifyPluginAsync } from 'fastify'

import { GetPackageVersionsRoute } from './get'
import { UpdatePackageVersionsRoute } from './update'

export const PackageVersionsRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetPackageVersionsRoute)
  await fastify.register(UpdatePackageVersionsRoute)
}
