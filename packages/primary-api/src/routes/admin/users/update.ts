import { Static, Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import { getDB } from '../../../db/db'
import type { ExpressionBuilder } from 'kysely'
import { sql } from 'kysely'
import {
  UserDeletedAt,
  UserEmail,
  UserFirstName,
  UserId,
  UserIsDeleted,
  UserLastName,
  UserUpdatedAt
} from '../../models/user'
import { DEFAULT_SCHEMA_CODES } from '../../../handlers/error'
import { getJSONFromDBResult } from '../../../util/getJSONFromDBResult'
import { Errors, InvalidRequestError, UnknownServerError } from '../../../handlers/customErrors'
import { getSimpleUserInfoById } from '../../../db/queries/getSimpleUserInfoById'
import type { Database } from '../../../db/models/Database'
import { getAllActiveMembershipsWithRoleByUserId } from '../../../db/queries/getAllActiveMembershipsWithRoleByUserId'
import { getActiveSiblingMembershipsWithRole } from '../../../db/queries/getActiveSiblingMemberships'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  id: UserId,
  firstName: Type.Optional(UserFirstName),
  lastName: Type.Optional(UserLastName),
  email: Type.Optional(UserEmail),
  isDeleted: Type.Optional(Type.Boolean({ description: 'Whether the user should be marked deleted.' }))
}, { additionalProperties: true })
export type UpdateBodyType = Static<typeof Delta>

export const UpdateReply = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    updatedAt: UserUpdatedAt,
    deletedAt: UserDeletedAt,
    isDeleted: UserIsDeleted
  })
])
export type UpdateResultType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

function standardReturn (eb: ExpressionBuilder<Database, 'user'>) {
  return [
    'id',
    'firstName',
    'lastName',
    'email',
    'updatedAt',
    'deletedAt',
    eb('deletedAt', 'is not', null).as('isDeleted')
  ] as const
}

async function update (delta: UpdateBodyType) {
  const db = await getDB()
  return db
    .updateTable('user')
    .set({
      firstName: delta.firstName,
      lastName: delta.lastName,
      email: delta.email,
      updatedAt: sql`NOW()`
    })
    .where('id', '=', delta.id)
    .returning(standardReturn)
    .executeTakeFirst()
}

async function reactivate (userId: string) {
  const db = await getDB()
  return db
    .updateTable('user')
    .set({
      deletedAt: null
    })
    .where('id', '=', userId)
    .returning(standardReturn)
    .executeTakeFirst()
}

async function deactivate (userId: string) {
  const db = await getDB()

  // Step 1: Boot the user from all non-unitary organizations
  await db
    .updateTable('userOrganization')
    .set({
      deletedAt: sql`NOW()`
    })
    .where('id', 'in', eb => eb
      .selectFrom('userOrganization')
      .innerJoin('organization', 'organization.id', 'userOrganization.organizationId')
      .select('userOrganization.id')
      .where('userOrganization.userId', '=', userId)
      .where('organization.isUnitary', '=', false)
    )
    .execute()

  // Step 2: Deactivate their unitary organization
  await db
    .updateTable('organization')
    .set({
      deletedAt: sql`NOW()`
    })
    .where('id', 'in', eb => eb
      .selectFrom('organization')
      .innerJoin('userOrganization', 'organization.id', 'userOrganization.organizationId')
      .select('organization.id')
      .where('userOrganization.userId', '=', userId)
      .where('organization.isUnitary', '=', true)
    )
    .execute()

  // Step 3: Deactivate the user
  return db
    .updateTable('user')
    .set({
      deletedAt: sql`NOW()`
    })
    .where('id', '=', userId)
    .returning(standardReturn)
    .executeTakeFirst()
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateUsersRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateResultType}>(
    '/users',
    {
      schema: {
        description: 'Applies a user patch and returns the updated user object',
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

      const currentInfo = await getSimpleUserInfoById(delta.id)
      if (currentInfo === undefined) {
        throw new InvalidRequestError('This user does not exist.', Errors.UserDoesNotExist)
      }

      if (currentInfo.isDeleted) {
        if (delta.isDeleted === false) {
          const result = await reactivate(delta.id)
          if (result === undefined) {
            throw new UnknownServerError('Unknown error occurred when attempting to reactivate the user.')
          }
          return getJSONFromDBResult(result)
        } else {
          throw new InvalidRequestError('Cannot update information for a user that has been deleted.', Errors.UserDeleted)
        }
      } else if (delta.isDeleted === true) {
        // Verify that we are not leaving any organizations without admins
        const adminMemberships = await getAllActiveMembershipsWithRoleByUserId(delta.id, 'Administrator')
        const hasAnotherAdminArray = await Promise.all(adminMemberships.map(async ({ membershipId, organizationName }) => {
          return {
            hasAnotherAdmin: (await getActiveSiblingMembershipsWithRole(membershipId, 'Administrator')).length !== 0,
            organizationName
          }
        }))
        for (const { organizationName, hasAnotherAdmin } of hasAnotherAdminArray) {
          if (!hasAnotherAdmin) {
            throw new InvalidRequestError(
              `Every organization must have at least one Administrator. No other users with the Administrator role are active in ${organizationName}.`,
              Errors.OrganizationRoleConstraintViolation
            )
          }
        }
        const result = await deactivate(delta.id)
        if (result === undefined) {
          throw new UnknownServerError('Unknown error occurred when attempting to deactivate the user.')
        }
        return getJSONFromDBResult(result)
      } else {
        const result = await update(delta)
        if (result === undefined) {
          throw new UnknownServerError('Unknown error occurred when attempting to update the user.')
        }
        return getJSONFromDBResult(result)
      }
    }
  )
}
