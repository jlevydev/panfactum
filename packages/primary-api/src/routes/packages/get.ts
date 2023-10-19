import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import type { Permission } from '../../db/models/OrganizationRolePermission'
import { getOrgIdsFromPackageIds } from '../../db/queries/getOrgIdsFromPackageIds'
import { applyGetSettings } from '../../db/queryBuilders/applyGetSettings'
import { filterByDate } from '../../db/queryBuilders/filterByDate'
import { filterByHasTimeMarker } from '../../db/queryBuilders/filterByHasTimeMarker'
import { filterByHaving } from '../../db/queryBuilders/filterByHaving'
import { filterByHavingDate } from '../../db/queryBuilders/filterByHavingDate'
import { filterByHavingNumber } from '../../db/queryBuilders/filterByHavingNumber'
import { filterBySearchName } from '../../db/queryBuilders/filterBySearchName'
import { filterByString } from '../../db/queryBuilders/filterByString'
import { InvalidQueryScopeError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import { OrganizationName } from '../models/organization'
import {
  PackageActiveVersionCount,
  PackageArchivedAt,
  PackageCreatedAt, PackageDeletedAt,
  PackageDescription, PackageDocumentationUrl, PackageHomepageUrl,
  PackageId, PackageIsArchived, PackageIsDeleted, PackageIsPublished, PackageLastPublishedAt,
  PackageName,
  PackageOrganizationId,
  PackageRepositoryUrl, PackageType, PackageUpdatedAt
} from '../models/package'
import {
  createGetReplyType, createQueryString
} from '../queryParams'
import type {
  GetQueryString
} from '../queryParams'

/**********************************************************************
 * Typings
 **********************************************************************/
const ResultProperties = {
  id: PackageId,
  organizationId: PackageOrganizationId,
  organizationName: OrganizationName,
  name: PackageName,
  description: PackageDescription,
  repositoryUrl: PackageRepositoryUrl,
  homepageUrl: PackageHomepageUrl,
  documentationUrl: PackageDocumentationUrl,
  packageType: PackageType,
  createdAt: PackageCreatedAt,
  updatedAt: PackageUpdatedAt,
  archivedAt: PackageArchivedAt,
  isArchived: PackageIsArchived,
  deletedAt: PackageDeletedAt,
  isDeleted: PackageIsDeleted,
  lastPublishedAt: PackageLastPublishedAt,
  activeVersionCount: PackageActiveVersionCount,
  isPublished: PackageIsPublished
}
const Result = Type.Object(ResultProperties)
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by', 'name')

const filters = {
  id: 'string' as const,
  organizationId: 'string' as const,
  organizationName: 'name' as const,
  name: 'name' as const,

  isDeleted: 'boolean' as const,
  isArchived: 'boolean' as const,
  isPublished: 'boolean' as const,

  createdAt: 'date' as const,
  archivedAt: 'date' as const,
  deletedAt: 'date' as const,
  updatedAt: 'date' as const,
  lastPublishedAt: 'date' as const,

  activeVersionCount: 'number' as const
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
const requiredPermissions = { oneOf: ['read:package', 'write:package'] as Permission[] }
async function assertHasPermission (req: FastifyRequest, packageIds?: string[], orgId?: string) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    if (orgId !== undefined) {
      await assertUserHasOrgPermissions(req, orgId, requiredPermissions)
    } else if (packageIds !== undefined) {
      const orgIds = await getOrgIdsFromPackageIds(packageIds)
      await Promise.all(orgIds.map(id => assertUserHasOrgPermissions(req, id, requiredPermissions)))
    } else {
      throw new InvalidQueryScopeError('Query too broad. Must specify at least one of the following query params: ids, id_strEq, or organizationId_strEq')
    }
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetPackagesRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/packages',
    {
      schema: {
        description: 'Returns a list of packages based on the given filters',
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
        organizationId_strEq,
        organizationName_strEq,
        name_strEq,

        name_nameSearch,
        organizationName_nameSearch,

        isArchived_boolean,
        isDeleted_boolean,
        isPublished_boolean,

        createdAt_after,
        createdAt_before,
        archivedAt_before,
        archivedAt_after,
        deletedAt_after,
        deletedAt_before,
        updatedAt_after,
        updatedAt_before,
        lastPublishedAt_after,
        lastPublishedAt_before,

        activeVersionCount_gt,
        activeVersionCount_gte,
        activeVersionCount_lt,
        activeVersionCount_lte,
        activeVersionCount_numEq
      } = req.query

      await assertHasPermission(req, id_strEq ? [id_strEq] : ids, organizationId_strEq)

      const db = await getDB()

      let query = db.selectFrom('package')
        .innerJoin('organization', 'organization.id', 'package.organizationId')
        .leftJoin('packageVersion', 'packageVersion.packageId', 'package.id')
        .select((eb) => [
          'package.id as id',
          'package.name as name',
          'package.description as description',
          'package.repositoryUrl as repositoryUrl',
          'package.homepageUrl as homepageUrl',
          'package.documentationUrl as documentationUrl',
          'package.packageType as packageType',
          'package.createdAt as createdAt',
          'package.updatedAt as updatedAt',
          'package.archivedAt as archivedAt',
          'package.deletedAt as deletedAt',
          'organization.id as organizationId',
          'organization.name as organizationName',
          eb('package.archivedAt', 'is not', null).as('isArchived'),
          eb('package.deletedAt', 'is not', null).as('isDeleted'),
          eb.fn.count<number>('packageVersion.id')
            .filterWhere(eb => eb('packageVersion.archivedAt', 'is', null))
            .distinct()
            .as('activeVersionCount'),
          // There is an issue with the kysely typings that doesn't allow max on a Date field even
          // though it is valid sql, so we use an `any` escape hatch
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
          eb.fn.max<number>('packageVersion.createdAt' as any).as('lastPublishedAt'),
          eb(eb.fn.count<number>('packageVersion.id').distinct(), '>', 0).as('isPublished')
        ])
        .groupBy(['package.id', 'organization.id'])

      query = filterByHasTimeMarker(
        query,
        { has: isDeleted_boolean },
        'package.deletedAt'
      )
      query = filterByHasTimeMarker(
        query,
        { has: isArchived_boolean },
        'package.archivedAt'
      )

      if (isPublished_boolean !== undefined) {
        query = filterByHaving(
          query,
          eb => eb(
            eb.fn.count<number>('packageVersion.id').distinct(),
            '>',
            0
          )
        )
      }

      query = filterByString(
        query,
        { eq: id_strEq },
        'package.id'
      )
      query = filterByString(
        query,
        { eq: organizationId_strEq },
        'package.organizationId'
      )
      query = filterByString(
        query,
        { eq: organizationName_strEq },
        'organization.name'
      )
      query = filterByString(
        query,
        { eq: name_strEq },
        'package.name'
      )

      query = filterByDate(
        query,
        {
          after: createdAt_after,
          before: createdAt_before
        },
        'package.createdAt'
      )
      query = filterByDate(
        query,
        {
          after: deletedAt_after,
          before: deletedAt_before
        },
        'package.deletedAt'
      )
      query = filterByDate(
        query,
        {
          after: archivedAt_before,
          before: archivedAt_after
        },
        'package.archivedAt'
      )
      query = filterByDate(
        query,
        {
          after: updatedAt_after,
          before: updatedAt_before
        },
        'package.updatedAt'
      )
      query = filterByHavingDate(
        query,
        {
          after: lastPublishedAt_after,
          before: lastPublishedAt_before
        },
        // There is an issue with the kysely typings that doesn't allow max on a Date field even
        // though it is valid sql, so we use an `any` escape hatch
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        eb => eb.fn.max<number>('packageVersion.createdAt' as any)
      )

      query = filterByHavingNumber(
        query,
        {
          gt: activeVersionCount_gt,
          gte: activeVersionCount_gte,
          lt: activeVersionCount_lt,
          lte: activeVersionCount_lte,
          eq: activeVersionCount_numEq
        },
        eb => eb.fn.count<number>('packageVersion.id')
          .filterWhere(eb => eb('packageVersion.archivedAt', 'is', null))
          .distinct()
      )

      query = filterBySearchName(
        query,
        {
          search: name_nameSearch
        },
        'package.name'
      )

      query = filterBySearchName(
        query,
        {
          search: organizationName_nameSearch
        },
        'organization.name'
      )

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'package.id'
      })

      const results = await query.execute()
      return createGetResult(results, page, perPage)
    }
  )
}
