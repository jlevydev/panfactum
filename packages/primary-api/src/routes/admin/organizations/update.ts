import { Static, Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import { getDB } from '../../../db/db'
import { ExpressionBuilder, sql } from 'kysely'
import {
  OrganizationDeletedAt,
  OrganizationId,
  OrganizationIsDeleted,
  OrganizationName,
  OrganizationUpdatedAt
} from '../../models/organization'
import { DEFAULT_SCHEMA_CODES } from '../../../handlers/error'
import { getJSONFromDBResult } from '../../../util/getJSONFromDBResult'
import { getOrgInfoById } from '../../../db/queries/getOrgInfoById'
import { Errors, InvalidRequestError, UnknownServerError } from '../../../handlers/customErrors'
import { getAdminRoleInfo } from '../../../db/queries/getAdminRoleInfo'
import type { Database } from '../../../db/models/Database'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  id: OrganizationId,
  name: Type.Optional(OrganizationName),
  isDeleted: Type.Optional(Type.Boolean({ description: 'Whether to delete or restore this organization.' }))
}, { additionalProperties: true })
type UpdateBodyType = Static<typeof Delta>

const UpdateReply = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    updatedAt: OrganizationUpdatedAt,
    deletedAt: OrganizationDeletedAt,
    isDeleted: OrganizationIsDeleted
  })
])
type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

function standardReturn (eb: ExpressionBuilder<Database, 'organization'>) {
  return [
    'id',
    'name',
    'updatedAt',
    'deletedAt',
    eb('deletedAt', 'is not', null).as('isDeleted')
  ] as const
}

async function update (delta: UpdateBodyType) {
  const db = await getDB()
  return db
    .updateTable('organization')
    .set({
      name: delta.name,
      updatedAt: sql`NOW()`
    })
    .where('id', '=', delta.id)
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
 * Route Logic
 **********************************************************************/

export const UpdateOrganizationsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/organizations',
    {
      schema: {
        description: 'Applies an organization patch and returns the updated org object',
        body: Delta,
        response: {
          200: UpdateReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      await assertPanfactumRoleFromSession(req, 'admin')

      const delta = req.body

      const currentInfo = await getOrgInfoById(delta.id)
      if (currentInfo === undefined) {
        throw new InvalidRequestError('This organization does not exist.', Errors.OrganizationDoesNotExist)
      }

      if (currentInfo.isDeleted) {
        if (delta.isDeleted === false) {
          if (currentInfo.isUnitary) {
            throw new InvalidRequestError("Cannot reactivate a user's personal organization directly. You must restore via re-enabling the user.", Errors.OrganizationConstraintViolation)
          } else {
            const result = await reactivate(delta.id)
            if (result === undefined) {
              throw new UnknownServerError('Unknown error occurred when attempting to reactive the organization.')
            }
            return getJSONFromDBResult(result)
          }
        } else {
          throw new InvalidRequestError('Cannot update information for an organization that has been deleted.', Errors.OrganizationDeleted)
        }
      } else if (delta.isDeleted === true) {
        if (currentInfo.isUnitary) {
          throw new InvalidRequestError("Cannot deactivate a user's personal organization directly. You must delete by de-activating the user.", Errors.OrganizationConstraintViolation)
        } else {
          const result = await deactivate(delta.id)
          if (result === undefined) {
            throw new UnknownServerError('Unknown error occurred when attempting to deactivate the organization.')
          }
          return getJSONFromDBResult(result)
        }
      } else {
        const result = await update(delta)
        if (result === undefined) {
          throw new UnknownServerError('Unknown error occurred when attempting to update the organization.')
        }
        return getJSONFromDBResult(result)
      }
    }
  )
}
