import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import type { Static } from '@sinclair/typebox'
import { DEFAULT_SCHEMA_CODES } from '../../constants'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import {
  convertSortOrder,
  createGetReplyType,
  createQueryString,
  GetQueryString
} from '../../types'
import { getDB } from '../../../db/db'
import { StringEnum } from '../../../util/customTypes'
import { dateToUnixSeconds } from '../../../util/dateToUnixSeconds'
import {
  UserId
} from '../../models/user'
import {
  OrganizationId, OrganizationIsUnitary, OrganizationMembershipCreatedAt, OrganizationMembershipDeletedAt,
  OrganizationName, OrganizationRoleId, OrganizationRoleName
} from '../../models/organization'
import { Type } from '@sinclair/typebox'

/**********************************************************************
 * Typings
 **********************************************************************/
const OrganizationMembership = Type.Object({
  id: Type.String(),
  userId: UserId,
  organizationId: OrganizationId,
  organizationName: OrganizationName,
  roleId: OrganizationRoleId,
  roleName: OrganizationRoleName,
  isUnitary: OrganizationIsUnitary,
  createdAt: OrganizationMembershipCreatedAt,
  deletedAt: OrganizationMembershipDeletedAt
})

const sortFields = StringEnum([
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
  isActive: Type.Boolean({ description: 'Return only active or inactive memberships' })
}
const QueryString = createQueryString(
  filters,
  sortFields
)
type QueryStringType = GetQueryString<typeof sortFields, typeof filters>

const Reply = createGetReplyType(OrganizationMembership)
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
        isActive
      } = req.query

      const db = await getDB()

      const memberships = await db.selectFrom('userOrganization')
        .innerJoin('organization', 'organization.id', 'userOrganization.organizationId')
        .innerJoin('organizationRole', 'organizationRole.id', 'userOrganization.roleId')
        .select([
          'userOrganization.id as id',
          'userOrganization.userId as userId',
          'userOrganization.organizationId as organizationId',
          'userOrganization.createdAt as createdAt',
          'userOrganization.deletedAt as deletedAt',
          'organization.name as organizationName',
          'organization.isUnitary as isUnitary',
          'organizationRole.id as roleId',
          'organizationRole.name as roleName'
        ])
        .$if(ids !== undefined, qb => qb.where('userOrganization.id', 'in', ids ?? []))
        .$if(userId !== undefined, qb => qb.where('userOrganization.userId', '=', userId ?? ''))
        .$if(organizationId !== undefined, qb => qb.where('userOrganization.organizationId', '=', organizationId ?? ''))
        .$if(isUnitary !== undefined, qb => qb.where('organization.isUnitary', '=', Boolean(isUnitary)))
        .$if(isActive !== undefined, qb => qb.where('userOrganization.deletedAt', isActive ? 'is' : 'is not', null))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()

      return {
        data: memberships.map(membership => ({
          ...membership,
          createdAt: dateToUnixSeconds(membership.createdAt),
          deletedAt: membership.deletedAt !== null ? dateToUnixSeconds(membership.deletedAt) : null,
          isActive: membership.deletedAt === null
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: memberships.length >= perPage
        }
      }
    }
  )
}
