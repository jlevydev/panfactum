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
  UserEmail,
  UserFirstName,
  UserId, UserLastName
} from '../../models/user'
import {
  OrganizationId, OrganizationIsUnitary, OrganizationMembershipCreatedAt, OrganizationMembershipDeletedAt,
  OrganizationName, OrganizationRoleId, OrganizationRoleName
} from '../../models/organization'
import { Type } from '@sinclair/typebox'

/**********************************************************************
 * Typings
 **********************************************************************/
const Result = Type.Object({
  id: Type.String(),
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
  deletedAt: OrganizationMembershipDeletedAt
})

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
  isActive: Type.Boolean({ description: 'Return only active or inactive memberships' })
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
        isActive
      } = req.query

      const db = await getDB()

      const results = await db.selectFrom('userOrganization')
        .innerJoin('organization', 'organization.id', 'userOrganization.organizationId')
        .innerJoin('organizationRole', 'organizationRole.id', 'userOrganization.roleId')
        .innerJoin('user', 'user.id', 'userOrganization.userId')
        .select([
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
          'user.email as userEmail'
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
        data: results.map(result => ({
          ...result,
          createdAt: dateToUnixSeconds(result.createdAt),
          deletedAt: result.deletedAt !== null ? dateToUnixSeconds(result.deletedAt) : null,
          isActive: result.deletedAt === null
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: results.length >= perPage
        }
      }
    }
  )
}
