import type { FastifyPluginAsync } from 'fastify'
import { GetUsersRoute } from './users/get'
import { UpdateUsersRoute } from './users/update'
import { GetOrganizationMemberships } from './organizationMemberships/get'
import { GetLoginSessions } from './loginSessions/get'
import { GetOrganizationsRoute } from './organizations/get'
import { UpdateOrganizationsRoute } from './organizations/update'
import { GetOrganizationRolesRoute } from './organizationRoles/get'
import { GetPackagesRoute } from './packages/get'
import { GetPackageVersionsRoute } from './packageVersions/get'
import { GetPackageDownloadsRoute } from './packageDownloads/get'
import { UpdateOrganizationMembershipRoute } from './organizationMemberships/update'

export const AdminRoutes: FastifyPluginAsync = async (fastify) => {
  const prefix = '/admin'
  await fastify.register(GetUsersRoute, { prefix })
  await fastify.register(UpdateUsersRoute, { prefix })
  await fastify.register(GetOrganizationMemberships, { prefix })
  await fastify.register(UpdateOrganizationMembershipRoute, { prefix })
  await fastify.register(GetLoginSessions, { prefix })
  await fastify.register(GetOrganizationsRoute, { prefix })
  await fastify.register(UpdateOrganizationsRoute, { prefix })
  await fastify.register(GetOrganizationRolesRoute, { prefix })
  await fastify.register(GetPackagesRoute, { prefix })
  await fastify.register(GetPackageVersionsRoute, { prefix })
  await fastify.register(GetPackageDownloadsRoute, { prefix })
}
