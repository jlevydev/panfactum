import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'
import { sql } from 'kysely'

import { getDB } from '../../db/db'
import type { OrganizationRolePermissionTable, Permission } from '../../db/models/OrganizationRolePermission'
import { getOrgRoleInfoById } from '../../db/queries/getOrgRoleInfoById'
import { getRoleInfoWithPermissionsByIds } from '../../db/queries/getRoleInfoWithPermissionsByIds'
import { Errors, ImmutableObjectError, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import type { OrgPermissionCheck } from '../../util/assertUserHasOrgPermissions'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { getJSONFromSettledPromises } from '../../util/getJSONFromSettledPromises'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  OrganizationRoleDescription,
  OrganizationRoleId,
  OrganizationRoleName,
  OrganizationRolePermissions,
  OrganizationRoleUpdatedAt
} from '../models/organization'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  name: Type.Optional(OrganizationRoleName),
  description: Type.Optional(OrganizationRoleDescription),
  permissions: Type.Optional(OrganizationRolePermissions)
}, { additionalProperties: false })
export type DeltaType = Static<typeof Delta>

const UpdateBody = Type.Object({
  ids: Type.Array(OrganizationRoleId),
  delta: Delta
})
export type UpdateBodyType = Static<typeof UpdateBody>

const UpdateResult = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    id: OrganizationRoleId,
    updatedAt: OrganizationRoleUpdatedAt
  })
])
export type UpdateResultType = Static<typeof UpdateResult>

export const UpdateReply = Type.Array(UpdateResult)
export type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

const restrictedRoleNames = new Set(['Administrator', 'User', 'Publisher', 'Billing Manager', 'Organization Manager'])
const requiredPermissions = { allOf: ['write:membership'] } as OrgPermissionCheck
const requiredPermissionsWithAdmin = { allOf: ['write:membership', 'admin'] } as OrgPermissionCheck
async function assertHasPermission (req: FastifyRequest, roleIds: string[], delta: DeltaType) {
  if (delta.name && restrictedRoleNames.has(delta.name)) {
    throw new InvalidRequestError(`Role name ${delta.name} is restricted. Roles cannot be named any of the following: ${Array.from(restrictedRoleNames).join(', ')}`, Errors.RestrictedRoleName)
  }

  const currentRoleInfoArray = await getRoleInfoWithPermissionsByIds(roleIds)

  // Verify that the user is not attempting to update an immutable global role
  for (const { id, organizationId } of (currentRoleInfoArray)) {
    if (organizationId === null) {
      throw new ImmutableObjectError(`Cannot update global role ${id} via the API as it is immutable. `)
    }
  }

  // Get the orgs for the non-global roles
  const roles = currentRoleInfoArray
    .filter((org): org is {id: string, name: string, permissions: Permission[], organizationId: string} => org.id !== null)

  const userPanfactumRole = await getPanfactumRoleFromSession(req)
  if (userPanfactumRole === null) {
    // Check to see if the user is updating permissions; if so, we need to do some more extensive checks
    const { permissions: newPermissions } = delta
    if (newPermissions) {
      // check if trying to add the admin permission and verify that the user has the admin permission in all the orgs
      if (newPermissions.includes('admin')) {
        await Promise.all(roles.map(({ organizationId }) => assertUserHasOrgPermissions(req, organizationId, requiredPermissionsWithAdmin)))

      // check if role has the admin permission and verify that the delta is not removing the permission
      } else {
        await Promise.all(roles.map(async ({ organizationId, permissions }) => {
          if (permissions.includes('admin')) {
            await assertUserHasOrgPermissions(req, organizationId, requiredPermissionsWithAdmin)
          }
        }))
      }
    } else {
      await Promise.all(roles.map(({ organizationId }) => assertUserHasOrgPermissions(req, organizationId, requiredPermissions)))
    }
  }
}

async function update (roleId: string, delta:DeltaType) {
  const db = await getDB()

  const { permissions } = delta
  // Ensure the update is transactional so we don't end up in a bad permissions state
  return db.transaction().execute(async (trx) => {
    // Indicates a permission update
    if (permissions) {
      // Step 1: Clear all the permissions from the role
      await trx.deleteFrom('organizationRolePermission')
        .where('organizationRolePermission.organizationRoleId', '=', roleId)
        .execute()

      // Step 2: Add the new permissions
      await trx.insertInto('organizationRolePermission')
        .values(permissions.map(permission => ({
          organizationRoleId: roleId,
          permission
        })))
        .execute()
    }
    return await trx.with(
      'role',
      qb => qb
        .updateTable('organizationRole')
        .set({
          updatedAt: sql`NOW()`,
          description: delta.description,
          name: delta.name
        })
        .where('organizationRole.id', '=', roleId)
        .returning([
          'id',
          'description',
          'updatedAt',
          'name'
        ])

    ).selectFrom('role')
      .innerJoin('organizationRolePermission', 'role.id', 'organizationRolePermission.organizationRoleId')
      .select(eb => [
        'role.id as id',
        'role.description as description',
        'role.updatedAt as updatedAt',
        'role.name as name',
        eb.fn.agg<OrganizationRolePermissionTable['permission'][]>('array_agg', ['organizationRolePermission.permission']).as('permissions')
      ])
      .groupBy(['role.id', 'role.description', 'role.updatedAt', 'role.name'])
      .executeTakeFirst()
  })
}

/**********************************************************************
 * Single Mutation
 **********************************************************************/
async function applyMutation (id: string, delta: DeltaType) {
  const currentInfo = await getOrgRoleInfoById(id)
  if (currentInfo === undefined) {
    throw new InvalidRequestError('This role does not exist.', Errors.RoleDoesNotExist, id)
  }

  const result = await update(id, delta)
  if (result === undefined) {
    throw new UnknownServerError('Unknown error occurred when attempting to update the role.', id)
  }
  return result
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateOrganizationRolesRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/organization-roles',
    {
      schema: {
        description: 'Applies organization role patches and returns the updated organization role objects',
        body: UpdateBody,
        response: {
          200: UpdateReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      const { ids, delta } = req.body
      await assertHasPermission(req, ids, delta)
      const results = await Promise.allSettled(ids.map(id => applyMutation(id, delta)))
      return getJSONFromSettledPromises(results)
    }
  )
}
