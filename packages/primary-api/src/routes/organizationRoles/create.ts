import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { Result } from './get'
import { requiredPermissions, requiredPermissionsWithAdmin, restrictedRoleNames } from './util'
import { getDB } from '../../db/db'
import { getAllRoleNamesByOrgId } from '../../db/queries/getAllRoleNamesByOrgId'
import { Errors, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { getJSONFromDBResult } from '../../util/getJSONFromDBResult'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  OrganizationRoleDescription, OrganizationRoleId,
  OrganizationRoleName,
  OrganizationRolePermissions
} from '../models/organization'

/**********************************************************************
 * Typings
 **********************************************************************/

const CreateBodyElement = Type.Object({
  name: OrganizationRoleName,
  description: Type.Optional(OrganizationRoleDescription),
  permissions: OrganizationRolePermissions,
  organizationId: OrganizationRoleId
}, { additionalProperties: false })
export type CreateBodyElementType = Static<typeof CreateBodyElement>

const CreateBody = Type.Array(CreateBodyElement)
export type CreateBodyType = Static<typeof CreateBody>

export const CreateReply = Type.Array(Result)
export type CreateReplyType = Static<typeof CreateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

async function assertHasPermission (req: FastifyRequest, roles: CreateBodyType) {
  for (const role of roles) {
    if (restrictedRoleNames.has(role.name)) {
      throw new InvalidRequestError(`Role name ${role.name} is restricted. Roles cannot be named any of the following: ${Array.from(restrictedRoleNames).join(', ')}`, Errors.RestrictedRoleName)
    }
  }

  const userPanfactumRole = await getPanfactumRoleFromSession(req)
  await Promise.all(roles.map(async ({ name, permissions, organizationId }) => {
    // Verify the name is unique
    const existingNames = await getAllRoleNamesByOrgId(organizationId)
    if (existingNames.includes(name)) {
      throw new InvalidRequestError(`Role name ${name} is already used as a role name.`, Errors.RoleExists)
    }

    // Panfactum admins already implicitly have admin privileges
    if (userPanfactumRole === null) {
      // Only users with admin permissions can create admin roles
      if (permissions.includes('admin')) {
        await assertUserHasOrgPermissions(req, organizationId, requiredPermissionsWithAdmin)
      } else {
        await assertUserHasOrgPermissions(req, organizationId, requiredPermissions)
      }
    }
  }))
}

async function create (role: CreateBodyElementType) {
  const db = await getDB()

  const { permissions, name } = role
  // Ensure the update is transactional so we don't end up in a bad permissions state
  return db.transaction().execute(async (trx) => {
    // Step 1: Create the role entry
    const partialResult = await trx.insertInto('organizationRole')
      .values([{
        name: role.name,
        description: role.description,
        organizationId: role.organizationId
      }])
      .returning([
        'id',
        'name',
        'description',
        'organizationId',
        'createdAt',
        'updatedAt'
      ])
      .executeTakeFirst()

    if (partialResult === undefined) {
      throw new UnknownServerError(`An unknown error occurred in creating the role ${name}.`)
    }

    // Step 2: Associate all the permissions
    if (permissions.length > 0) {
      await trx.insertInto('organizationRolePermission')
        .values(permissions.map(permission => ({ permission, organizationRoleId: partialResult.id })))
        .execute()
    }

    // Step 3: Augment the partial result with the standard return data
    return {
      ...partialResult,
      isCustom: true,
      activeAssigneeCount: 0,
      permissions
    }
  })
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const CreateOrganizationRolesRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.post<{Body: CreateBodyType, Reply: CreateReplyType}>(
    '/organization-roles',
    {
      schema: {
        description: 'Create new organization roles',
        body: CreateBody,
        response: {
          201: CreateReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      const roles = req.body
      await assertHasPermission(req, roles)
      const results = await Promise.all(roles.map(create))
      return results.map(getJSONFromDBResult)
    }
  )
}
