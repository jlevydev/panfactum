/**********************************************************************
 * Typings
 **********************************************************************/
import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { requiredPermissions, requiredPermissionsWithAdmin } from './util'
import { getDB } from '../../db/db'
import { getRoleInfoByIds } from '../../db/queries/getRoleInfoByIds'
import { Errors, ImmutableObjectError, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import { deleteQueryString } from '../DeleteQueryString'
import { OrganizationRoleId } from '../models/organization'

const Reply = Type.Array(OrganizationRoleId)
export type ReplyType = Static<typeof Reply>

const QueryString = deleteQueryString(OrganizationRoleId)
export type QueryStringType = Static<typeof QueryString>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

async function assertHasPermission (req: FastifyRequest, roleIds: string[]) {
  const currentRoleInfoArray = await getRoleInfoByIds(roleIds, { withPermissions: true, withActiveAssigneeCount: true })

  // Verify the role exists
  for (const id of roleIds) {
    if (currentRoleInfoArray.findIndex(info => info.id === id) === -1) {
      throw new InvalidRequestError('This role does not exist.', Errors.RoleDoesNotExist, id)
    }
  }

  const userPanfactumRole = await getPanfactumRoleFromSession(req)
  await Promise.all(currentRoleInfoArray.map(async ({ organizationId, permissions, id, activeAssigneeCount }) => {
    if (!permissions) {
      throw new UnknownServerError('A problem occurred when fetching permission set for this role.', id)
    } else if (organizationId === null) {
      throw new ImmutableObjectError('Cannot delete global role via the API as it is immutable.', id)
    } else if (activeAssigneeCount === undefined) {
      throw new UnknownServerError('A problem occurred when fetching active assignee count for this role.', id)
    } else if (activeAssigneeCount !== 0) {
      throw new InvalidRequestError(`Cannot delete role as it is assigned to ${activeAssigneeCount} users.`, Errors.OrganizationRoleConstraintViolation, id)
    } else {
      // Panfactum admins already implicitly have admin privileges
      if (userPanfactumRole === null) {
        // Must have the admin permission to delete a role with admin permissions
        if (permissions.includes('admin')) {
          await assertUserHasOrgPermissions(req, organizationId, requiredPermissionsWithAdmin)
        } else {
          await assertUserHasOrgPermissions(req, organizationId, requiredPermissions)
        }
      }
    }
  }))
}

async function executeDelete (roleIds: string[]) {
  const db = await getDB()

  // Ensure the update is transactional so we don't end up in a bad permissions state
  return db.transaction().execute(async (trx) => {
    // Sets all users who were assigned the to-be-deleted role, the role of User
    await trx.with(
      'role',
      qb => qb
        .selectFrom('organizationRole')
        .select(['organizationRole.id'])
        .where('organizationRole.organizationId', 'is', null)
        .where('organizationRole.name', '=', 'User')
    ).updateTable('userOrganization')
      .set(eb => ({
        roleId: eb.selectFrom('role').select(['id']).limit(1)
      }))
      .where('userOrganization.roleId', 'in', roleIds)
      .execute()

    // Perform the deletion
    await trx.deleteFrom('organizationRole')
      .where('organizationRole.id', 'in', roleIds)
      .execute()
  })
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const DeleteOrganizationRolesRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.delete<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/organization-roles',
    {
      schema: {
        description: 'Deletes organization roles by id',
        querystring: QueryString,
        response: {
          200: Reply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      const { ids } = req.query
      await assertHasPermission(req, ids)
      await executeDelete(ids)
      return ids
    }
  )
}
