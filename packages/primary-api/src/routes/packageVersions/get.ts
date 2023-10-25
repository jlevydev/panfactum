import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import type { Permission } from '../../db/models/OrganizationRolePermission'
import { getOrgIdsFromPackageVersionIds } from '../../db/queries/getOrgIdsFromPackageVersionIds'
import { applyGetSettings } from '../../db/queryBuilders/applyGetSettings'
import { filterByDate } from '../../db/queryBuilders/filterByDate'
import { filterByHasTimeMarker } from '../../db/queryBuilders/filterByHasTimeMarker'
import { filterByNumber } from '../../db/queryBuilders/filterByNumber'
import { filterBySearchName } from '../../db/queryBuilders/filterBySearchName'
import { filterByString } from '../../db/queryBuilders/filterByString'
import { InvalidQueryScopeError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import type { GetQueryString } from '../GetQueryString'
import { createQueryString } from '../GetQueryString'
import { getReplyType } from '../GetReplyType'
import {
  PackageType,
  PackageVersionArchivedAt,
  PackageVersionCreatedAt,
  PackageVersionCreatedBy,
  PackageVersionDeletedAt,
  PackageVersionDownloadCount,
  PackageVersionId,
  PackageVersionIsArchived,
  PackageVersionIsDeleted,
  PackageVersionPackageId,
  PackageVersionPackageName,
  PackageVersionSizeBytes,
  PackageVersionTag
} from '../models/package'
import { UserEmail, UserFirstName, UserLastName } from '../models/user'
/**********************************************************************
 * Typings
 **********************************************************************/
const ResultProperties = {
  id: PackageVersionId,
  packageId: PackageVersionPackageId,
  packageName: PackageVersionPackageName,
  packageType: PackageType,
  versionTag: PackageVersionTag,
  sizeBytes: PackageVersionSizeBytes,
  createdBy: PackageVersionCreatedBy,
  createdByFirstName: UserFirstName,
  createdByLastName: UserLastName,
  createdByEmail: UserEmail,
  createdAt: PackageVersionCreatedAt,
  archivedAt: PackageVersionArchivedAt,
  isArchived: PackageVersionIsArchived,
  deletedAt: PackageVersionDeletedAt,
  isDeleted: PackageVersionIsDeleted,
  downloadCount: PackageVersionDownloadCount
}
const Result = Type.Object(ResultProperties)
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by', 'createdAt')
export type SortType = Static<typeof sortFields>

const filters = {
  packageId: 'string' as const,
  organizationId: 'string' as const,
  isDeleted: 'boolean' as const,
  isArchived: 'boolean' as const,
  packageName: 'name' as const,
  versionTag: 'name' as const,
  sizeBytes: 'number' as const,
  createdBy: 'string' as const,
  createdAt: 'date' as const,
  archivedAt: 'date' as const,
  deletedAt: 'date' as const,
  downloadCount: 'number' as const
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
const requiredPermissions = { oneOf: ['read:package', 'write:package'] as Permission[] }
async function assertHasPermission (req: FastifyRequest, packageIds?: string[], orgId?: string) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    if (orgId !== undefined) {
      await assertUserHasOrgPermissions(req, orgId, requiredPermissions)
    } else if (packageIds !== undefined) {
      const orgIds = await getOrgIdsFromPackageVersionIds(packageIds)
      await Promise.all(orgIds.map(id => assertUserHasOrgPermissions(req, id, requiredPermissions)))
    } else {
      throw new InvalidQueryScopeError('Query too broad. Must specify at least one of the following query params: ids, id_strEq, or organizationId_strEq')
    }
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetPackageVersionsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/package-versions',
    {
      schema: {
        description: 'Returns a list of package versions based on the given filters',
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
        packageId_strEq,
        packageName_strEq,
        versionTag_strEq,
        createdBy_strEq,
        organizationId_strEq,

        packageName_nameSearch,
        versionTag_nameSearch,

        isDeleted_boolean,
        isArchived_boolean,

        createdAt_before,
        createdAt_after,
        deletedAt_before,
        deletedAt_after,
        archivedAt_after,
        archivedAt_before,

        sizeBytes_gt,
        sizeBytes_numEq,
        sizeBytes_gte,
        sizeBytes_lt,
        sizeBytes_lte,
        downloadCount_gt,
        downloadCount_gte,
        downloadCount_lt,
        downloadCount_lte,
        downloadCount_numEq
      } = req.query

      await assertHasPermission(req, packageId_strEq ? [packageId_strEq] : ids, organizationId_strEq)

      const db = await getDB()

      // Todo: The download count operation here is _VERY_ expensive due to the amount
      // of rows that need to be traversed. At even moderate, this will need to be memoized.
      let query = db.with(
        'downloads',
        eb => eb.selectFrom('packageVersion')
          .innerJoin('packageDownload', 'packageDownload.versionId', 'packageVersion.id')
          .select(eb => [
            'packageVersion.id as id',
            eb.fn.count<number>('packageDownload.id').distinct().as('downloadCount')
          ])
          .groupBy('packageVersion.id')
      )
        .selectFrom('packageVersion')
        .innerJoin('package', 'package.id', 'packageVersion.packageId')
        .innerJoin('user', 'user.id', 'packageVersion.createdBy')
        .innerJoin('downloads', 'downloads.id', 'packageVersion.id')
        .select((eb) => [
          'packageVersion.id as id',
          'packageVersion.packageId as packageId',
          'package.name as packageName',
          'package.packageType as packageType',
          'packageVersion.versionTag as versionTag',
          'packageVersion.sizeBytes as sizeBytes',
          'packageVersion.createdBy as createdBy',
          'user.firstName as createdByFirstName',
          'user.lastName as createdByLastName',
          'user.email as createdByEmail',
          'packageVersion.createdAt as createdAt',
          'packageVersion.archivedAt as archivedAt',
          'packageVersion.deletedAt as deletedAt',
          eb('packageVersion.archivedAt', 'is not', null).as('isArchived'),
          eb('packageVersion.deletedAt', 'is not', null).as('isDeleted'),
          'downloads.downloadCount as downloadCount'
        ])

      query = filterByHasTimeMarker(
        query,
        { has: isDeleted_boolean },
        'packageVersion.deletedAt'
      )

      query = filterByHasTimeMarker(
        query,
        { has: isArchived_boolean },
        'packageVersion.archivedAt'
      )

      query = filterByString(
        query,
        { eq: organizationId_strEq },
        'package.organizationId'
      )
      query = filterByString(
        query,
        { eq: packageId_strEq },
        'packageVersion.packageId'
      )
      query = filterByString(
        query,
        { eq: packageName_strEq },
        'package.name'
      )
      query = filterByString(
        query,
        { eq: versionTag_strEq },
        'packageVersion.versionTag'
      )
      query = filterByString(
        query,
        { eq: createdBy_strEq },
        'packageVersion.createdBy'
      )

      query = filterByDate(
        query,
        {
          before: createdAt_before,
          after: createdAt_after
        },
        'packageVersion.createdAt'
      )
      query = filterByDate(
        query,
        {
          before: deletedAt_before,
          after: deletedAt_after
        },
        'packageVersion.deletedAt'
      )
      query = filterByDate(
        query,
        {
          before: archivedAt_before,
          after: archivedAt_after
        },
        'packageVersion.archivedAt'
      )

      query = filterByNumber(
        query,
        {
          eq: sizeBytes_numEq,
          gt: sizeBytes_gt,
          gte: sizeBytes_gte,
          lt: sizeBytes_lt,
          lte: sizeBytes_lte
        },
        'packageVersion.sizeBytes'
      )

      query = filterByNumber(
        query,
        {
          eq: downloadCount_numEq,
          gt: downloadCount_gt,
          gte: downloadCount_gte,
          lt: downloadCount_lt,
          lte: downloadCount_lte
        },
        'downloads.downloadCount'
      )

      query = filterBySearchName(
        query,
        {
          search: versionTag_nameSearch
        },
        'packageVersion.versionTag'
      )

      query = filterBySearchName(
        query,
        {
          search: packageName_nameSearch
        },
        'package.name'
      )

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'packageVersion.id'
      })

      const results = await query.execute()
      return createGetResult(results, page, perPage)
    }
  )
}
