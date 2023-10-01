import type { FastifyPluginAsync } from 'fastify'

import { GetUsersRoute } from './get'
import { UpdateUsersRoute } from './update'

export const UsersRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(GetUsersRoute)
  await fastify.register(UpdateUsersRoute)
}
