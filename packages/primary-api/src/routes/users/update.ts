import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema, FastifyRequest } from 'fastify'
import type { ExpressionBuilder } from 'kysely'
import { sql } from 'kysely'

import { getDB } from '../../db/db'
import type { Database } from '../../db/models/Database'
import { getActiveSiblingMembershipsWithRole } from '../../db/queries/getActiveSiblingMemberships'
import { getAllActiveMembershipsWithRoleByUserId } from '../../db/queries/getAllActiveMembershipsWithRoleByUserId'
import { getSimpleUserInfoById } from '../../db/queries/getSimpleUserInfoById'
import { Errors, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasUserPermissions } from '../../util/assertUserHasUserPermissions'
import { getJSONFromSettledPromises } from '../../util/getJSONFromSettledPromises'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  UserDeletedAt,
  UserEmail,
  UserFirstName,
  UserId,
  UserIsDeleted,
  UserLastName,
  UserUpdatedAt
} from '../models/user'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  firstName: Type.Optional(UserFirstName),
  lastName: Type.Optional(UserLastName),
  email: Type.Optional(UserEmail),
  isDeleted: Type.Optional(Type.Boolean({ description: 'Whether the user should be marked deleted.' }))
}, { additionalProperties: true })
export type DeltaType = Static<typeof Delta>

const UpdateBody = Type.Object({
  ids: Type.Array(UserId),
  delta: Delta
})
export type UpdateBodyType = Static<typeof UpdateBody>

export const UpdateResult = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    id: UserId,
    updatedAt: UserUpdatedAt,
    deletedAt: UserDeletedAt,
    isDeleted: UserIsDeleted
  })
])
export type UpdateResultType = Static<typeof UpdateResult>

export const UpdateReply = Type.Array(UpdateResult)
export type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/
async function assertHasPermission (req: FastifyRequest, userIds: string[]) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    await Promise.all(userIds.map(id => assertUserHasUserPermissions(req, id)))
  }
}
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

async function update (id: string, delta: DeltaType) {
  const db = await getDB()
  return db
    .updateTable('user')
    .set({
      firstName: delta.firstName,
      lastName: delta.lastName,
      email: delta.email,
      updatedAt: sql`NOW()`
    })
    .where('id', '=', id)
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
 * Single Mutation
 **********************************************************************/
async function applyMutation (id: string, delta: DeltaType) {
  const currentInfo = await getSimpleUserInfoById(id)
  if (currentInfo === undefined) {
    throw new InvalidRequestError('This user does not exist.', Errors.UserDoesNotExist, id)
  }
  if (currentInfo.isDeleted) {
    if (delta.isDeleted === false) {
      const result = await reactivate(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown error occurred when attempting to reactivate the user.', id)
      }
      return result
    } else {
      throw new InvalidRequestError('Cannot update information for a user that has been deactivated.', Errors.UserDeleted, id)
    }
  } else if (delta.isDeleted === true) {
    // Verify that we are not leaving any organizations without admins
    const adminMemberships = await getAllActiveMembershipsWithRoleByUserId(id, 'Administrator')
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
          Errors.OrganizationRoleConstraintViolation,
          id
        )
      }
    }
    const result = await deactivate(id)
    if (result === undefined) {
      throw new UnknownServerError('Unknown error occurred when attempting to deactivate the user.', id)
    }
    return result
  } else {
    const result = await update(id, delta)
    if (result === undefined) {
      throw new UnknownServerError('Unknown error occurred when attempting to update the user.', id)
    }
    return result
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateUsersRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/users',
    {
      schema: {
        description: 'Applies user patches and returns the updated user objects',
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
