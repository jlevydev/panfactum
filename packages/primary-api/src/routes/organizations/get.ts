import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import { applyGetSettings } from '../../db/queryBuilders/applyGetSettings'
import { filterByBoolean } from '../../db/queryBuilders/filterByBoolean'
import { filterByDate } from '../../db/queryBuilders/filterByDate'
import { filterByHasTimeMarker } from '../../db/queryBuilders/filterByHasTimeMarker'
import { filterByHavingNumber } from '../../db/queryBuilders/filterByHavingNumber'
import { filterBySearchName } from '../../db/queryBuilders/filterBySearchName'
import { filterByString } from '../../db/queryBuilders/filterByString'
import { InvalidQueryScopeError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserInOrg } from '../../util/assertUserInOrg'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  OrganizationActiveMemberCount, OrganizationActivePackageCount,
  OrganizationCreatedAt,
  OrganizationDeletedAt,
  OrganizationIsDeleted,
  OrganizationIsUnitary,
  OrganizationName,
  OrganizationUpdatedAt
} from '../models/organization'
import type { GetQueryString } from '../queryParams'
import {
  createGetReplyType,
  createQueryString
} from '../queryParams'

/**********************************************************************
 * Typings
 **********************************************************************/
const ResultProperties = {
  id: Type.String(),
  name: OrganizationName,
  isUnitary: OrganizationIsUnitary,
  createdAt: OrganizationCreatedAt,
  deletedAt: OrganizationDeletedAt,
  updatedAt: OrganizationUpdatedAt,
  isDeleted: OrganizationIsDeleted,
  activeMemberCount: OrganizationActiveMemberCount,
  activePackageCount: OrganizationActivePackageCount
}
const Result = Type.Object(ResultProperties)
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by', 'name')

const filters = {
  id: 'string' as const,
  name: 'name' as const,

  isUnitary: 'boolean' as const,
  isDeleted: 'boolean' as const,

  createdAt: 'date' as const,
  deletedAt: 'date' as const,
  updatedAt: 'date' as const,

  activeMemberCount: 'number' as const,
  activePackageCount: 'number' as const
}
export type FiltersType = typeof filters

const QueryString = createQueryString(
  filters,
  sortFields
)
type QueryStringType = GetQueryString<typeof sortFields, typeof filters>

const Reply = createGetReplyType(Result)
type ReplyType = Static<typeof Reply>

/**********************************************************************
 * Helpers
 **********************************************************************/
async function assertHasPermission (req: FastifyRequest, id?: string, ids?: string[]) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    if (id !== undefined) {
      await assertUserInOrg(req, id)
    } else if (ids !== undefined) {
      await Promise.all(ids.map(id => assertUserInOrg(req, id)))
    } else {
      throw new InvalidQueryScopeError('Query too broad. Must specify at least one of the following query params: ids, id_strEq')
    }
  }
}

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
      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        id_strEq,
        name_strEq,

        name_nameSearch,

        isDeleted_boolean,
        isUnitary_boolean,

        createdAt_before,
        createdAt_after,
        deletedAt_before,
        deletedAt_after,
        updatedAt_before,
        updatedAt_after,

        activeMemberCount_gt,
        activeMemberCount_gte,
        activeMemberCount_lt,
        activeMemberCount_lte,
        activeMemberCount_numEq,
        activePackageCount_gt,
        activePackageCount_gte,
        activePackageCount_lt,
        activePackageCount_lte,
        activePackageCount_numEq
      } = req.query

      await assertHasPermission(req, id_strEq, ids)

      const db = await getDB()

      let query = db.selectFrom('organization')
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
          eb.fn.count<number>('package.id')
            .filterWhere(eb => eb('package.archivedAt', 'is', null))
            .distinct()
            .as('activePackageCount'),
          eb.fn.count<number>('userOrganization.id')
            .filterWhere(eb => eb('userOrganization.deletedAt', 'is', null))
            .distinct()
            .as('activeMemberCount')
        ])
        .groupBy('organization.id')

      query = filterByString(
        query,
        { eq: id_strEq },
        'organization.id'
      )
      query = filterByString(
        query,
        { eq: name_strEq },
        'organization.name'
      )

      query = filterByBoolean(
        query,
        { is: isUnitary_boolean },
        'organization.isUnitary'
      )
      query = filterByHasTimeMarker(
        query,
        { has: isDeleted_boolean },
        'organization.deletedAt'
      )

      query = filterByDate(
        query,
        {
          before: createdAt_before,
          after: createdAt_after
        },
        'organization.createdAt'
      )
      query = filterByDate(
        query,
        {
          before: deletedAt_before,
          after: deletedAt_after
        },
        'organization.deletedAt'
      )
      query = filterByDate(
        query,
        {
          before: updatedAt_before,
          after: updatedAt_after
        },
        'organization.updatedAt'
      )

      query = filterByHavingNumber(
        query,
        {
          eq: activeMemberCount_numEq,
          gt: activeMemberCount_gt,
          gte: activeMemberCount_gte,
          lt: activeMemberCount_lt,
          lte: activeMemberCount_lte
        },
        eb => eb.fn.count<number>('userOrganization.id')
          .filterWhere(eb => eb('userOrganization.deletedAt', 'is', null))
          .distinct()
      )

      query = filterByHavingNumber(
        query,
        {
          eq: activePackageCount_numEq,
          gt: activePackageCount_gt,
          gte: activePackageCount_gte,
          lt: activePackageCount_lt,
          lte: activePackageCount_lte
        },
        eb => eb.fn.count<number>('package.id')
          .filterWhere(eb => eb('package.archivedAt', 'is', null))
          .distinct()
      )

      query = filterBySearchName(
        query,
        {
          search: name_nameSearch
        },
        'organization.name'
      )

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'organization.id'
      })

      const results = await query.execute()

      return createGetResult(results, page, perPage)
    }
  )
}
