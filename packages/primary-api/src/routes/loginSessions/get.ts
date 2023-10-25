import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import { getUserIdsFromLoginSessionIds } from '../../db/queries/getUserIdsFromLoginSessionIds'
import { applyGetSettings } from '../../db/queryBuilders/applyGetSettings'
import { filterByDate } from '../../db/queryBuilders/filterByDate'
import { filterByString } from '../../db/queryBuilders/filterByString'
import { InvalidQueryScopeError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasUserPermissions } from '../../util/assertUserHasUserPermissions'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import type { GetQueryString } from '../GetQueryString'
import {
  createQueryString
} from '../GetQueryString'
import { getReplyType } from '../GetReplyType'
import {
  AuthLoginSessionCreatedAt,
  AuthLoginSessionId,
  AuthLoginSessionLastApiCallAt,
  AuthMasqueradingUserId
} from '../models/auth'
import {
  UserId
} from '../models/user'

/**********************************************************************
 * Typings
 **********************************************************************/
const ResultProperties = {
  id: AuthLoginSessionId,
  userId: UserId,
  masqueradingUserId: Type.Union([
    AuthMasqueradingUserId,
    Type.Null()
  ], { description: 'If `null`, the user is not being masqueraded.' }),
  createdAt: AuthLoginSessionCreatedAt,
  lastApiCallAt: AuthLoginSessionLastApiCallAt
}
const Result = Type.Object(ResultProperties)
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by', 'lastApiCallAt')
export type SortType = Static<typeof sortFields>

const filters = {
  id: 'string' as const,
  userId: 'string' as const,
  masqueradingUserId: 'string' as const,

  createdAt: 'date' as const,
  lastApiCallAt: 'date' as const
}
export type FiltersType = typeof filters

const QueryString = createQueryString(
  filters,
  sortFields
)
type QueryStringType = GetQueryString<typeof sortFields, typeof filters>

const Reply = getReplyType(Result)
type ReplyType = Static<typeof Reply>

/**********************************************************************
 * Helpers
 **********************************************************************/
async function assertHasPermission (req: FastifyRequest, sessionIds?: string[], userId?: string) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    if (userId !== undefined) {
      await assertUserHasUserPermissions(req, userId)
    } else if (sessionIds !== undefined) {
      const userIds = await getUserIdsFromLoginSessionIds(sessionIds)
      await Promise.all(userIds.map(id => assertUserHasUserPermissions(req, id)))
    } else {
      throw new InvalidQueryScopeError('Query too broad. Must specify at least one of the following query params: ids, id_strEq, userId_strEq')
    }
  }
}

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
      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        id_strEq,
        userId_strEq,
        masqueradingUserId_strEq,

        createdAt_before,
        createdAt_after,
        lastApiCallAt_before,
        lastApiCallAt_after
      } = req.query

      await assertHasPermission(req, id_strEq ? [id_strEq] : ids, userId_strEq)

      const db = await getDB()

      let query = db.selectFrom('userLoginSession')
        .select([
          'userLoginSession.id as id',
          'userLoginSession.userId as userId',
          'userLoginSession.masqueradingUserId as masqueradingUserId',
          'userLoginSession.createdAt as createdAt',
          'userLoginSession.lastApiCallAt as lastApiCallAt'
        ])

      query = filterByString(
        query,
        { eq: id_strEq },
        'userLoginSession.id'
      )
      query = filterByString(
        query,
        { eq: userId_strEq },
        'userLoginSession.userId'
      )
      query = filterByString(
        query,
        { eq: masqueradingUserId_strEq },
        'userLoginSession.masqueradingUserId'
      )

      query = filterByDate(
        query,
        {
          before: createdAt_before,
          after: createdAt_after
        },
        'userLoginSession.createdAt'
      )
      query = filterByDate(
        query,
        {
          before: lastApiCallAt_before,
          after: lastApiCallAt_after
        },
        'userLoginSession.lastApiCallAt'
      )

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'userLoginSession.id'
      })

      const results = await query.execute()
      return createGetResult(results, page, perPage)
    }
  )
}
