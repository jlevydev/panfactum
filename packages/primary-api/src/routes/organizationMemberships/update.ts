import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema, FastifyRequest } from 'fastify'
import { sql } from 'kysely'
import type { ExpressionBuilder } from 'kysely'

import { getDB } from '../../db/db'
import type { Database } from '../../db/models/Database'
import { getActiveSiblingMembershipsWithRole } from '../../db/queries/getActiveSiblingMemberships'
import { getMembershipInfoById } from '../../db/queries/getMembershipInfoById'
import { getOrgIdsFromOrgMembershipIds } from '../../db/queries/getOrgIdsFromOrgMembershipIds'
import { getOrgInfoById } from '../../db/queries/getOrgInfoById'
import { getRoleInfoById } from '../../db/queries/getRoleInfoById'
import { getSimpleUserInfoById } from '../../db/queries/getSimpleUserInfoById'
import { Errors, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import type { OrgPermissionCheck } from '../../util/assertUserHasOrgPermissions'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { getJSONFromSettledPromises } from '../../util/getJSONFromSettledPromises'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  OrganizationMembershipCreatedAt,
  OrganizationMembershipDeletedAt,
  OrganizationMembershipId,
  OrganizationMembershipIsDeleted,
  OrganizationRoleId,
  OrganizationRoleName
} from '../models/organization'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  roleId: Type.Optional(OrganizationRoleId),
  isDeleted: Type.Optional(OrganizationMembershipIsDeleted)
}, { additionalProperties: false })
export type DeltaType = Static<typeof Delta>

const UpdateBody = Type.Object({
  ids: Type.Array(OrganizationMembershipId),
  delta: Delta
})
export type UpdateBodyType = Static<typeof UpdateBody>

export const UpdateResult = Type.Composite([
  Delta,
  Type.Object({
    id: OrganizationMembershipId,
    roleName: Type.Optional(OrganizationRoleName),
    createdAt: Type.Optional(OrganizationMembershipCreatedAt),
    deletedAt: Type.Optional(OrganizationMembershipDeletedAt)
  })
])
export type UpdateResultType = Static<typeof UpdateResult>

export const UpdateReply = Type.Array(UpdateResult)
export type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

// TODO: Only Administrators should be able to change the status of other administrators (changing their roles, kicking them, etc.)
const requiredPermissions = { allOf: ['write:membership'] } as OrgPermissionCheck
async function assertHasPermission (req: FastifyRequest, membershipIds: string[]) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    const orgIds = await getOrgIdsFromOrgMembershipIds(membershipIds)
    await Promise.all(orgIds.map(id => assertUserHasOrgPermissions(req, id, requiredPermissions)))
  }
}

function standardReturn (eb: ExpressionBuilder<Database, 'userOrganization'>) {
  return [
    'id',
    'deletedAt',
    'roleId',
    'createdAt',
    eb('deletedAt', 'is not', null).as('isDeleted')
  ] as const
}

async function noop (membershipId: string) {
  const db = await getDB()
  return db
    .selectFrom('userOrganization')
    .select(standardReturn)
    .where('id', '=', membershipId)
    .executeTakeFirst()
}

async function setIsDeleted (membershipId: string) {
  const db = await getDB()
  return db
    .updateTable('userOrganization')
    .set({
      deletedAt: sql`NOW()`
    })
    .where('id', '=', membershipId)
    .returning(standardReturn)
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
    .returning(standardReturn)
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
    .returning(standardReturn)
    .executeTakeFirst()
}

/**********************************************************************
 * Single Mutation
 **********************************************************************/
async function applyMutation (id: string, delta: DeltaType) {
  const currentInfo = await getMembershipInfoById(id)
  if (currentInfo === undefined) {
    throw new InvalidRequestError('This membership does not exist.', Errors.MembershipDoesNotExist, id)
  }

  if (currentInfo.isDeleted) {
    if (delta.isDeleted === false) {
      const roleId = delta.roleId ?? currentInfo.roleId // If newInfo does not specify a role, fallback on the original role
      const [role, org, user] = await Promise.all([
        getRoleInfoById(roleId),
        getOrgInfoById(currentInfo.orgId),
        getSimpleUserInfoById(currentInfo.userId)
      ])
      if (user === undefined) {
        throw new InvalidRequestError('Cannot reactivate membership as user does not exist.', Errors.UserDoesNotExist, id)
      } else if (user.isDeleted) {
        throw new InvalidRequestError('Cannot reactivate membership as user has been deleted.', Errors.UserDeleted, id)
      } else if (org === undefined) {
        throw new InvalidRequestError('Cannot reactivate membership as organization does not exist.', Errors.OrganizationDoesNotExist, id)
      } else if (org.isDeleted) {
        throw new InvalidRequestError('Cannot change memberships of an organization which has been deleted.', Errors.OrganizationDeleted, id)
      } else if (role === undefined) {
        throw new InvalidRequestError('Cannot reactivate membership with given role as the role does not exist.', Errors.RoleDoesNotExist, id)
      } else if (role.organizationId !== null && role.organizationId !== currentInfo.orgId) {
        throw new InvalidRequestError(`Cannot reactivate membership with given role (${role.name}) as it is not available to this organization.`, Errors.RoleNotAvailable, id)
      }
      const result = await reactivateMembership(id, roleId)

      if (result === undefined) {
        throw new UnknownServerError('Unknown error occurred when attempting to reactivate the membership')
      }
      return { ...result, roleName: role.name }
    } else {
      throw new InvalidRequestError('Cannot update the info of a membership that has already been deleted.', Errors.MembershipDeleted, id)
    }
  } else {
    // If it is an administrator of an organization, we need to make sure
    // that changing the user's role doesn't leave the organization without an admin
    // As a result, regardless of whether this membership is being changed or deleted,
    // we need to ensure that there is at least one other Administrator
    if (currentInfo.roleName === 'Administrator') {
      const otherAdmins = await getActiveSiblingMembershipsWithRole(id, 'Administrator')
      if (otherAdmins.length === 0) {
        throw new InvalidRequestError(
          'Every organization must have at least one Administrator. No other users with the Administrator role are active in the organization.',
          Errors.OrganizationRoleConstraintViolation,
          id
        )
      }
    }

    if (delta.isDeleted === true) {
      const result = await setIsDeleted(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown error occurred when attempting to delete the membership.', id)
      }
      return result
    } else if (delta.roleId !== undefined) {
      const role = await getRoleInfoById(delta.roleId)
      if (role === undefined) {
        throw new InvalidRequestError('Cannot update membership with given role as the role does not exist.', Errors.RoleDoesNotExist, id)
      } else if (role.organizationId !== null && role.organizationId !== currentInfo.orgId) {
        throw new InvalidRequestError(`Cannot update membership with given role (${role.name}) as it is not available to this organization.`, Errors.RoleNotAvailable, id)
      }
      const result = await setRole(id, delta.roleId)
      if (result === undefined) {
        throw new UnknownServerError('Unknown error occurred when attempting to update the membership.', id)
      }
      return { ...result, roleName: role.name }
    } else {
      const result = await noop(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown error occurred when attempting to update the membership.', id)
      }
      return result
    }
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateOrganizationMembershipsRoutes:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/organization-memberships',
    {
      schema: {
        description: 'Applies a set of membership patches and returns the updated membership objects.',
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
      await assertHasPermission(req, ids)
      const results = await Promise.allSettled(ids.map(id => applyMutation(id, delta)))
      return getJSONFromSettledPromises(results)
    }
  )
}
