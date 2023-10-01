import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertPanfactumRoleFromSession } from '../../util/assertPanfactumRoleFromSession'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import {
  OrganizationId,
  OrganizationIsUnitary,
  OrganizationMembershipCreatedAt,
  OrganizationMembershipDeletedAt, OrganizationMembershipId,
  OrganizationMembershipIsDeleted,
  OrganizationName,
  OrganizationRoleId,
  OrganizationRoleName
} from '../models/organization'
import {
  UserEmail,
  UserFirstName,
  UserId, UserLastName
} from '../models/user'
import {
  convertSortOrder,
  createGetReplyType,
  createQueryString
} from '../types'
import type {
  GetQueryString
} from '../types'

/**********************************************************************
 * Typings
 **********************************************************************/
const Result = Type.Object({
  id: OrganizationMembershipId,
  userId: UserId,
  userFirstName: UserFirstName,
  userLastName: UserLastName,
  userEmail: UserEmail,
  organizationId: OrganizationId,
  organizationName: OrganizationName,
  roleId: OrganizationRoleId,
  roleName: OrganizationRoleName,
  isUnitary: OrganizationIsUnitary,
  createdAt: OrganizationMembershipCreatedAt,
  deletedAt: OrganizationMembershipDeletedAt,
  isDeleted: OrganizationMembershipIsDeleted
})
export type ResultType = Static<typeof Result>

const sortFields = StringEnum([
  'userLastName',
  'userFirstName',
  'userEmail',
  'roleName',
  'userId',
  'organizationId',
  'organizationName',
  'isUnitary',
  'id'
], 'The field to sort by', 'organizationId')
const filters = {
  userId: Type.String({ format: 'uuid', description: 'Return only memberships for this user' }),
  organizationId: Type.String({ format: 'uuid', description: 'Return only memberships for this organization' }),
  isUnitary: Type.Boolean({ description: 'Return only unitary or non-unitary memberships' }),
  isDeleted: Type.Boolean({ description: 'If provided, filter the results by whether the organization membership has been deleted' })
}
const QueryString = createQueryString(
  filters,
  sortFields
)
type QueryStringType = GetQueryString<typeof sortFields, typeof filters>

const Reply = createGetReplyType(Result)
type ReplyType = Static<typeof Reply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetOrganizationMemberships:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/organization-memberships',
    {
      schema: {
        description: 'Returns a list of organizations memberships based on the given filters',
        querystring: QueryString,
        response: {
          200: Reply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      await assertPanfactumRoleFromSession(req, 'admin')

      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        userId,
        isUnitary,
        organizationId,
        isDeleted
      } = req.query

      const db = await getDB()

      const results = await db.selectFrom('userOrganization')
        .innerJoin('organization', 'organization.id', 'userOrganization.organizationId')
        .innerJoin('organizationRole', 'organizationRole.id', 'userOrganization.roleId')
        .innerJoin('user', 'user.id', 'userOrganization.userId')
        .select(eb => [
          'userOrganization.id as id',
          'userOrganization.userId as userId',
          'userOrganization.organizationId as organizationId',
          'userOrganization.createdAt as createdAt',
          'userOrganization.deletedAt as deletedAt',
          'organization.name as organizationName',
          'organization.isUnitary as isUnitary',
          'organizationRole.id as roleId',
          'organizationRole.name as roleName',
          'user.firstName as userFirstName',
          'user.lastName as userLastName',
          'user.email as userEmail',
          eb('userOrganization.deletedAt', 'is not', null).as('isDeleted')
        ])
        .$if(ids !== undefined, qb => qb.where('userOrganization.id', 'in', ids ?? []))
        .$if(userId !== undefined, qb => qb.where('userOrganization.userId', '=', userId ?? ''))
        .$if(organizationId !== undefined, qb => qb.where('userOrganization.organizationId', '=', organizationId ?? ''))
        .$if(isUnitary !== undefined, qb => qb.where('organization.isUnitary', '=', Boolean(isUnitary)))
        .$if(isDeleted !== undefined, qb => qb.where('userOrganization.deletedAt', isDeleted ? 'is not' : 'is', null))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()

      return createGetResult(results, page, perPage)
    }
  )
}
