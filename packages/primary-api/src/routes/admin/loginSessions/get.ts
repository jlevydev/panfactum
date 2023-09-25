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
import { Type } from '@sinclair/typebox'
import {
  AuthLoginSessionCreatedAt,
  AuthLoginSessionId,
  AuthLoginSessionLastApiCallAt,
  AuthMasqueradingUserId
} from '../../models/auth'

/**********************************************************************
 * Typings
 **********************************************************************/
const LoginSession = Type.Object({
  id: AuthLoginSessionId,
  userId: UserId,
  masqueradingUserId: Type.Union([
    AuthMasqueradingUserId,
    Type.Null()
  ], { description: 'If `null`, the user is not being masqueraded.' }),
  createdAt: AuthLoginSessionCreatedAt,
  lastApiCallAt: AuthLoginSessionLastApiCallAt
})

const sortFields = StringEnum([
  'userId',
  'masqueradingUserId',
  'createdAt',
  'lastApiCallAt',
  'id'
], 'The field to sort by', 'lastApiCallAt')
const filters = {
  userId: Type.String({ format: 'uuid', description: 'Return only login sessions for this user' }),
  masqueradingUserId: Type.String({ format: 'uuid', description: 'Return only login sessions for this masquerading user' })
}
const QueryString = createQueryString(
  filters,
  sortFields
)
type QueryStringType = GetQueryString<typeof sortFields, typeof filters>

const Reply = createGetReplyType(LoginSession)
type ReplyType = Static<typeof Reply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetLoginSessions:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/login-sessions',
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
        masqueradingUserId
      } = req.query

      const db = await getDB()

      const sessions = await db.selectFrom('userLoginSession')
        .select([
          'userLoginSession.id as id',
          'userLoginSession.userId as userId',
          'userLoginSession.masqueradingUserId as masqueradingUserId',
          'userLoginSession.createdAt as createdAt',
          'userLoginSession.lastApiCallAt as lastApiCallAt'
        ])
        .$if(ids !== undefined, qb => qb.where('userLoginSession.id', 'in', ids ?? []))
        .$if(userId !== undefined, qb => qb.where('userLoginSession.userId', '=', userId ?? ''))
        .$if(masqueradingUserId !== undefined, qb => qb.where('userLoginSession.masqueradingUserId', '=', masqueradingUserId ?? ''))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()

      return {
        data: sessions.map(sessions => ({
          ...sessions,
          createdAt: dateToUnixSeconds(sessions.createdAt),
          lastApiCallAt: sessions.lastApiCallAt !== null ? dateToUnixSeconds(sessions.lastApiCallAt) : null
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: sessions.length >= perPage
        }
      }
    }
  )
}
