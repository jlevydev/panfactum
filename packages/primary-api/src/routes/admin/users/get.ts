import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import type { Static } from '@sinclair/typebox'
import { DEFAULT_SCHEMA_CODES } from '../../constants'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import { User } from './types'
import {
  convertSortOrder,
  createGetReplyType,
  createQueryString,
  GetQueryString
} from '../../types'
import { getDB } from '../../../db/db'
import { StringEnum } from '../../../util/customTypes'

/**********************************************************************
 * Typings
 **********************************************************************/

const sortFields = StringEnum([
  'id',
  'firstName',
  'lastName',
  'email',
  'createdAt',
  'numberOfOrgs'
], 'id')
const filters = {}
export const GetUsersQueryString = createQueryString(
  filters,
  sortFields
)
export type GetUsersQueryStringType = GetQueryString<typeof sortFields, typeof filters>

export const GetUsersReply = createGetReplyType(User)
export type GetUsersReplyType = Static<typeof GetUsersReply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetUsersRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: GetUsersQueryStringType, Reply: GetUsersReplyType}>(
    '/users',
    {
      schema: {
        querystring: GetUsersQueryString,
        response: {
          200: GetUsersReply,
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
        ids
      } = req.query

      const db = await getDB()
      const users = await db.selectFrom('user')
        .innerJoin('userOrganization', 'user.id', 'userOrganization.userId')
        .select([
          'user.id as id',
          'user.firstName as firstName',
          'user.lastName as lastName',
          'user.email as email',
          'user.createdAt as createdAt',
          db.fn.count<number>('userOrganization.organizationId').as('numberOfOrgs')
        ])
        .groupBy('user.id')
        .$if(Boolean(ids), qb => qb.where('user.id', 'in', ids ?? []))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .limit(perPage)
        .offset(page * perPage)
        .execute()
      return {
        data: users.map(user => ({
          ...user,
          createdAt: Math.floor(user.createdAt.getTime() / 1000)
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: users.length >= perPage
        }
      }
    }
  )
}
