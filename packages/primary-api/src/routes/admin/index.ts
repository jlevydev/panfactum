import type { FastifyPluginAsync } from 'fastify'
import { GetUsersRoute } from './users/get'
import { UpdateUsersRoute } from './users/update'
import { GetOrganizationMemberships } from './organizationMemberships/get'
import { GetLoginSessions } from './loginSessions/get'

export const AdminRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/admin'
  await fastify.register(GetUsersRoute, { prefix })
  await fastify.register(UpdateUsersRoute, { prefix })
  await fastify.register(GetOrganizationMemberships, { prefix })
  await fastify.register(GetLoginSessions, { prefix })
}
