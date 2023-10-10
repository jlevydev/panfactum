import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema, FastifyRequest } from 'fastify'
import type { ExpressionBuilder } from 'kysely'
import { sql } from 'kysely'

import { getDB } from '../../db/db'
import type { Database } from '../../db/models/Database'
import { getAdminRoleInfo } from '../../db/queries/getAdminRoleInfo'
import { getOrgInfoById } from '../../db/queries/getOrgInfoById'
import { Errors, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import type { OrgPermissionCheck } from '../../util/assertUserHasOrgPermissions'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { getJSONFromSettledPromises } from '../../util/getJSONFromSettledPromises'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  OrganizationDeletedAt,
  OrganizationId,
  OrganizationIsDeleted,
  OrganizationName,
  OrganizationUpdatedAt
} from '../models/organization'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  name: Type.Optional(OrganizationName),
  isDeleted: Type.Optional(Type.Boolean({ description: 'Whether to delete or restore this organization.' }))
}, { additionalProperties: true })
export type DeltaType = Static<typeof Delta>

const UpdateBody = Type.Object({
  ids: Type.Array(OrganizationId),
  delta: Delta
})
export type UpdateBodyType = Static<typeof UpdateBody>

const UpdateResult = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    id: OrganizationId,
    updatedAt: OrganizationUpdatedAt,
    deletedAt: OrganizationDeletedAt,
    isDeleted: OrganizationIsDeleted
  })
])
export type UpdateResultType = Static<typeof UpdateResult>

export const UpdateReply = Type.Array(UpdateResult)
export type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/
const requiredPermissions = { allOf: ['write:organization'] } as OrgPermissionCheck
async function assertHasPermission (req: FastifyRequest, orgIds: string[]) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    await Promise.all(orgIds.map(id => assertUserHasOrgPermissions(req, id, requiredPermissions)))
  }
}

function standardReturn (eb: ExpressionBuilder<Database, 'organization'>) {
  return [
    'id',
    'name',
    'updatedAt',
    'deletedAt',
    eb('deletedAt', 'is not', null).as('isDeleted')
  ] as const
}

async function update (id: string, delta: DeltaType) {
  const db = await getDB()
  return db
    .updateTable('organization')
    .set({
      name: delta.name,
      updatedAt: sql`NOW()`
    })
    .where('id', '=', id)
    .returning(standardReturn)
    .executeTakeFirst()
}

async function reactivate (orgId: string) {
  const db = await getDB()
  return db
    .updateTable('organization')
    .set({
      deletedAt: null
    })
    .where('id', '=', orgId)
    .returning(standardReturn)
    .executeTakeFirst()
}

async function deactivate (orgId: string) {
  const db = await getDB()

  const adminRoleInfo = await getAdminRoleInfo()
  if (adminRoleInfo === undefined) {
    throw new UnknownServerError('Unable to retrieve the global admin role info. Canceling deactivation.')
  }

  // If the org is getting de-activated, we immediately
  // boot all users who are not Administrators
  // We allow Administrators to continue to access the organization
  // as it still potentially will have live assets being served by
  // its customers. We do the remaining clean-up asynchronously
  try {
    await db
      .updateTable('userOrganization')
      .set({
        deletedAt: sql`NOW()`
      })
      .where('userOrganization.organizationId', '=', orgId)
      .where('userOrganization.roleId', '!=', adminRoleInfo.id)
      .execute()
  } catch (e) {
    throw new UnknownServerError('Unable remove organization memberships. Canceling deactivation.')
  }

  return db
    .updateTable('organization')
    .set({
      deletedAt: sql`NOW()`
    })
    .where('id', '=', orgId)
    .returning(standardReturn)
    .executeTakeFirst()
}

/**********************************************************************
 * Single Mutation
 **********************************************************************/
async function applyMutation (id: string, delta: DeltaType) {
  const currentInfo = await getOrgInfoById(id)
  if (currentInfo === undefined) {
    throw new InvalidRequestError('This organization does not exist.', Errors.OrganizationDoesNotExist, id)
  }
  if (currentInfo.isDeleted) {
    if (delta.isDeleted === false) {
      if (currentInfo.isUnitary) {
        throw new InvalidRequestError("Cannot reactivate a user's personal organization directly. You must restore via re-enabling the user.", Errors.OrganizationConstraintViolation, id)
      } else {
        const result = await reactivate(id)
        if (result === undefined) {
          throw new UnknownServerError('Unknown error occurred when attempting to reactive the organization.', id)
        }
        return result
      }
    } else {
      throw new InvalidRequestError('Cannot update information for an organization that has been deleted.', Errors.OrganizationDeleted, id)
    }
  } else if (delta.isDeleted === true) {
    if (currentInfo.isUnitary) {
      throw new InvalidRequestError("Cannot deactivate a user's personal organization directly. You must delete by de-activating the user.", Errors.OrganizationConstraintViolation, id)
    } else {
      const result = await deactivate(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown error occurred when attempting to deactivate the organization.', id)
      }
      return result
    }
  } else {
    const result = await update(id, delta)
    if (result === undefined) {
      throw new UnknownServerError('Unknown error occurred when attempting to update the organization.', id)
    }
    return result
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateOrganizationsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/organizations',
    {
      schema: {
        description: 'Applies organization patches and returns the updated org objects',
        body: Delta,
        response: {
          200: UpdateReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      const { ids, delta } = req.body
      await assertHasPermission(req, ids)
      const results = await Promise.allSettled(ids.map(id => applyMutation(id, delta)))
      return getJSONFromSettledPromises(results)
    }
  )
}
