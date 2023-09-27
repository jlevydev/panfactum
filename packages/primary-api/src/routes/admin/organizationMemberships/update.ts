import { Static, Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import { getDB } from '../../../db/db'
import { sql } from 'kysely'
import {
  OrganizationMembershipCreatedAt,
  OrganizationMembershipDeletedAt,
  OrganizationMembershipId,
  OrganizationMembershipIsDeleted,
  OrganizationRoleId,
  OrganizationRoleName
} from '../../models/organization'
import { Errors, InvalidRequestError, UnknownServerError } from '../../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../../handlers/error'
import { getJSONFromDBResult } from '../../../util/getJSONFromDBResult'
import { getMembershipInfoById } from '../../../db/queries/getMembershipInfoById'
import { getRoleInfoById } from '../../../db/queries/getRoleInfoById'
import { getOrgInfoById } from '../../../db/queries/getOrgInfoById'
import { getSimpleUserInfoById } from '../../../db/queries/getSimpleUserInfoById'
import { getActiveSiblingMembershipsWithRole } from '../../../db/queries/getActiveSiblingMemberships'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  id: OrganizationMembershipId,
  roleId: Type.Optional(OrganizationRoleId),
  isDeleted: Type.Optional(OrganizationMembershipIsDeleted)
}, { additionalProperties: true })
export type UpdateBodyType = Static<typeof Delta>

export const UpdateReply = Type.Composite([
  Delta,
  Type.Object({
    roleName: Type.Optional(OrganizationRoleName),
    createdAt: Type.Optional(OrganizationMembershipCreatedAt),
    deletedAt: Type.Optional(OrganizationMembershipDeletedAt)
  })
])
export type UpdateResultType = Static<typeof UpdateReply>
type UpdateReplyType = UpdateResultType

/**********************************************************************
 * Query Helpers
 **********************************************************************/

async function setIsDeleted (membershipId: string) {
  const db = await getDB()
  return db
    .updateTable('userOrganization')
    .set({
      deletedAt: sql`NOW()`
    })
    .where('id', '=', membershipId)
    .returning(eb => [
      'id',
      'deletedAt',
      eb('deletedAt', 'is', null).as('isDeleted')
    ])
    .executeTakeFirst()
}

async function setRole (membershipId: string, roleId: string) {
  const db = await getDB()
  return db
    .updateTable('userOrganization')
    .set(eb => ({
      // Ensure the foreign key constraint is valid
      roleId: eb
        .selectFrom('organizationRole')
        .select('id')
        .where('organizationRole.id', '=', roleId)
        .limit(1)
    }))
    .where('id', '=', membershipId)
    .returning([
      'id',
      'roleId'
    ])
    .executeTakeFirst()
}

async function reactivateMembership (membershipId: string, roleId: string) {
  const db = await getDB()
  return db
    .updateTable('userOrganization')
    .set(eb => ({
      // Ensure the foreign key constraint is valid
      roleId: eb
        .selectFrom('organizationRole')
        .select('id')
        .where('organizationRole.id', '=', roleId)
        .limit(1),
      createdAt: sql`NOW()`,
      deletedAt: null
    }))
    .where('id', '=', membershipId)
    .returning(eb => [
      'id',
      'createdAt',
      'deletedAt',
      eb('deletedAt', 'is', null).as('isDeleted')
    ])
    .executeTakeFirst()
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateOrganizationMembershipRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/organization-memberships',
    {
      schema: {
        description: 'Applies a set of membership patches and returns the updated membership objects.',
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

      const newInfo = req.body

      const currentInfo = await getMembershipInfoById(newInfo.id)
      if (currentInfo === undefined) {
        throw new InvalidRequestError('This membership does not exist.', Errors.MembershipDoesNotExist)
      }

      if (currentInfo.isDeleted) {
        if (newInfo.isDeleted === false) {
          const roleId = newInfo.roleId ?? currentInfo.roleId // If newInfo does not specify a role, fallback on the original role
          const [role, org, user] = await Promise.all([
            getRoleInfoById(roleId),
            getOrgInfoById(currentInfo.orgId),
            getSimpleUserInfoById(currentInfo.userId)
          ])
          if (user === undefined) {
            throw new InvalidRequestError('Cannot reactivate membership as user does not exist.', Errors.UserDoesNotExist)
          } else if (user.isDeleted) {
            throw new InvalidRequestError('Cannot reactivate membership as user has been deleted.', Errors.UserDeleted)
          } else if (org === undefined) {
            throw new InvalidRequestError('Cannot reactivate membership as organization does not exist.', Errors.OrganizationDoesNotExist)
          } else if (org.isDeleted) {
            throw new InvalidRequestError('Cannot change memberships of an organization which has been deleted.', Errors.OrganizationDeleted)
          } else if (role === undefined) {
            throw new InvalidRequestError('Cannot reactivate membership with given role as the role does not exist.', Errors.RoleDoesNotExist)
          } else if (role.organizationId !== null && role.organizationId !== currentInfo.orgId) {
            throw new InvalidRequestError(`Cannot reactivate membership with given role (${role.name}) as it is not available to this organization.`, Errors.RoleNotAvailable)
          }
          const result = await reactivateMembership(newInfo.id, roleId)

          if (result === undefined) {
            throw new UnknownServerError('Unknown error occurred when attempting to reactivate the membership')
          }
          return getJSONFromDBResult({ ...result, roleName: role.name })
        } else {
          throw new InvalidRequestError('Cannot update the info of a membership that has already been deleted.', Errors.MembershipDeleted)
        }
      } else {
        // If it is an administrator of an organization, we need to make sure
        // that changing the user's role doesn't leave the organization without an admin
        // As a result, regardless of whether this membership is being changed or deleted,
        // we need to ensure that there is at least one other Administrator
        if (currentInfo.roleName === 'Administrator') {
          const otherAdmins = await getActiveSiblingMembershipsWithRole(newInfo.id, 'Administrator')
          if (otherAdmins.length === 0) {
            throw new InvalidRequestError(
              'Every organization must have at least one Administrator. No other users with the Administrator role are active in the organization.',
              Errors.OrganizationRoleConstraintViolation
            )
          }
        }

        if (newInfo.isDeleted === true) {
          const result = await setIsDeleted(newInfo.id)
          if (result === undefined) {
            throw new UnknownServerError('Unknown error occurred when attempting to delete the membership.')
          }
          return getJSONFromDBResult(result)
        } else if (newInfo.roleId !== undefined) {
          const role = await getRoleInfoById(newInfo.roleId)
          if (role === undefined) {
            throw new InvalidRequestError('Cannot update membership with given role as the role does not exist.', Errors.RoleDoesNotExist)
          } else if (role.organizationId !== null && role.organizationId !== currentInfo.orgId) {
            throw new InvalidRequestError(`Cannot update membership with given role (${role.name}) as it is not available to this organization.`, Errors.RoleNotAvailable)
          }
          const result = await setRole(newInfo.id, newInfo.roleId)
          if (result === undefined) {
            throw new UnknownServerError('Unknown error occurred when attempting to update the membership.')
          }
          return getJSONFromDBResult({ ...result, roleName: role.name })
        } else {
          return req.body
        }
      }
    }
  )
}
