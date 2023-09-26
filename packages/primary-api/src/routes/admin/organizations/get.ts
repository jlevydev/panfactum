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
  OrganizationActiveMemberCount, OrganizationActivePackageCount,
  OrganizationCreatedAt,
  OrganizationDeletedAt,
  OrganizationIsDeleted,
  OrganizationIsUnitary,
  OrganizationName,
  OrganizationUpdatedAt
} from '../../models/organization'
import { Type } from '@sinclair/typebox'

/**********************************************************************
 * Typings
 **********************************************************************/
const Result = Type.Object({
  id: Type.String(),
  name: OrganizationName,
  isUnitary: OrganizationIsUnitary,
  createdAt: OrganizationCreatedAt,
  deletedAt: OrganizationDeletedAt,
  updatedAt: OrganizationUpdatedAt,
  isDeleted: OrganizationIsDeleted,
  activeMemberCount: OrganizationActiveMemberCount,
  activePackageCount: OrganizationActivePackageCount
})
export type ResultType = Static<typeof Result>

const sortFields = StringEnum([
  'id',
  'name',
  'isUnitary',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'isDeleted',
  'activeMemberCount',
  'activePackageCount'
], 'The field to sort by', 'name')
const filters = {
  isUnitary: Type.Boolean({ description: 'If provided, filter the results by whether the organization is unitary' }),
  isDeleted: Type.Boolean({ description: 'If provided, filter the results by whether the organization has been deleted' })
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

export const GetOrganizationsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/organizations',
    {
      schema: {
        description: 'Returns a list of organizations based on the given filters',
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
        isUnitary,
        isDeleted
      } = req.query

      const db = await getDB()

      const results = await db.selectFrom('organization')
        .leftJoin('userOrganization', 'organization.id', 'userOrganization.organizationId')
        .leftJoin('package', 'organization.id', 'package.organizationId')
        .select((eb) => [
          'organization.id as id',
          'organization.name as name',
          'organization.isUnitary as isUnitary',
          'organization.createdAt as createdAt',
          'organization.deletedAt as deletedAt',
          'organization.updatedAt as updatedAt',
          eb('organization.deletedAt', 'is not', null).as('isDeleted'),
          eb.fn.count<number>('userOrganization.id').distinct().as('activeMemberCount'),
          eb.fn.count<number>('package.id').distinct().as('activePackageCount')
        ])
        .where('userOrganization.deletedAt', 'is', null)
        .where('package.archivedAt', 'is', null)
        .$if(ids !== undefined, qb => qb.where('organization.id', 'in', ids ?? []))
        .$if(isUnitary !== undefined, qb => qb.where('organization.isUnitary', '=', Boolean(isUnitary)))
        .$if(isDeleted !== undefined, qb => qb.where('userOrganization.deletedAt', isDeleted ? 'is not' : 'is', null))
        .groupBy('organization.id')
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()

      return {
        data: results.map(result => ({
          ...result,
          createdAt: dateToUnixSeconds(result.createdAt),
          deletedAt: dateToUnixSeconds(result.deletedAt),
          updatedAt: dateToUnixSeconds(result.updatedAt),
          isDeleted: Boolean(result.isDeleted)
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: results.length >= perPage
        }
      }
    }
  )
}
