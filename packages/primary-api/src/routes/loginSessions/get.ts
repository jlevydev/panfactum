import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertPanfactumRoleFromSession } from '../../util/assertPanfactumRoleFromSession'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import {
  AuthLoginSessionCreatedAt,
  AuthLoginSessionId,
  AuthLoginSessionLastApiCallAt,
  AuthMasqueradingUserId
} from '../models/auth'
import {
  UserId
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
  id: AuthLoginSessionId,
  userId: UserId,
  masqueradingUserId: Type.Union([
    AuthMasqueradingUserId,
    Type.Null()
  ], { description: 'If `null`, the user is not being masqueraded.' }),
  createdAt: AuthLoginSessionCreatedAt,
  lastApiCallAt: AuthLoginSessionLastApiCallAt
})
export type ResultType = Static<typeof Result>

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

const Reply = createGetReplyType(Result)
type ReplyType = Static<typeof Reply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetLoginSessions:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/login-sessions',
    {
      schema: {
        description: 'Returns a list of login sessions based on the given filters',
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

      const results = await db.selectFrom('userLoginSession')
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

      return createGetResult(results, page, perPage)
    }
  )
}
