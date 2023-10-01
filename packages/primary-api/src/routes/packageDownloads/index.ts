import type { FastifyPluginAsync } from 'fastify'

import { GetPackageDownloadsRoute } from './get'

export const PackageDownloadsRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetPackageDownloadsRoute)
}
