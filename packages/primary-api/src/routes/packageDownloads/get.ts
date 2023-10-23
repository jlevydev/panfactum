import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import type { Permission } from '../../db/models/OrganizationRolePermission'
import { getOrgIdsFromPackageDownloadIds } from '../../db/queries/getOrgIdsFromPackageDownloadIds'
import { applyGetSettings } from '../../db/queryBuilders/applyGetSettings'
import { filterByDate } from '../../db/queryBuilders/filterByDate'
import { filterBySearchName } from '../../db/queryBuilders/filterBySearchName'
import { filterByString } from '../../db/queryBuilders/filterByString'
import { InvalidQueryScopeError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  PackageDownloadCreatedAt,
  PackageDownloadId, PackageDownloadIP, PackageDownloadUserId, PackageDownloadVersionId, PackageId, PackageName,
  PackageVersionTag
} from '../models/package'
import { UserEmail, UserFirstName, UserLastName } from '../models/user'
import type { GetQueryString } from '../queryParams'
import {
  createGetReplyType,
  createQueryString
} from '../queryParams'

/**********************************************************************
 * Typings
 **********************************************************************/
const ResultProperties = {
  id: PackageDownloadId,
  versionId: PackageDownloadVersionId,
  versionTag: PackageVersionTag,
  packageId: PackageId,
  packageName: PackageName,
  userId: PackageDownloadUserId,
  userFirstName: UserFirstName,
  userLastName: UserLastName,
  userEmail: UserEmail,
  createdAt: PackageDownloadCreatedAt,
  ip: PackageDownloadIP
}
const Result = Type.Object(ResultProperties)
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by', 'createdAt')
export type SortType = Static<typeof sortFields>

const filters = {
  id: 'string' as const,
  versionId: 'string' as const,
  versionTag: 'name' as const,
  packageId: 'string' as const,
  packageName: 'name' as const,
  userId: 'string' as const,
  ip: 'string' as const,
  organizationId: 'string' as const,

  userFirstName: 'name' as const,
  userLastName: 'name' as const,
  userEmail: 'name' as const,

  createdAt: 'date' as const
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
async function assertHasPermission (req: FastifyRequest, downloadIds?: string[], orgId?: string) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    if (orgId !== undefined) {
      await assertUserHasOrgPermissions(req, orgId, requiredPermissions)
    } else if (downloadIds !== undefined) {
      const orgIds = await getOrgIdsFromPackageDownloadIds(downloadIds)
      await Promise.all(orgIds.map(id => assertUserHasOrgPermissions(req, id, requiredPermissions)))
    } else {
      throw new InvalidQueryScopeError('Query too broad. Must specify at least one of the following query params: ids, id_strEq, or organizationId_strEq')
    }
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetPackageDownloadsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/package-downloads',
    {
      schema: {
        description: 'Returns a list of package downloads based on the given filters',
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
        versionTag_strEq,
        versionId_strEq,
        packageId_strEq,
        packageName_strEq,
        userId_strEq,
        userEmail_strEq,
        userFirstName_strEq,
        userLastName_strEq,
        ip_strEq,
        organizationId_strEq,

        packageName_nameSearch,
        versionTag_nameSearch,
        userFirstName_nameSearch,
        userLastName_nameSearch,
        userEmail_nameSearch,

        createdAt_before,
        createdAt_after
      } = req.query

      await assertHasPermission(req, id_strEq ? [id_strEq] : ids, organizationId_strEq)

      const db = await getDB()

      let query = db
        .selectFrom('packageDownload')
        .innerJoin('packageVersion', 'packageVersion.id', 'packageDownload.versionId')
        .innerJoin('package', 'package.id', 'packageVersion.packageId')
        .innerJoin('user', 'user.id', 'packageDownload.userId')
        .select([
          'packageDownload.id as id',
          'packageVersion.id as versionId',
          'packageVersion.versionTag as versionTag',
          'package.id as packageId',
          'package.name as packageName',
          'user.id as userId',
          'user.firstName as userFirstName',
          'user.lastName as userLastName',
          'user.email as userEmail',
          'packageDownload.createdAt as createdAt',
          'packageDownload.ip as ip'
        ])

      query = filterByString(
        query,
        { eq: organizationId_strEq },
        'package.organizationId'
      )
      query = filterByString(
        query,
        { eq: id_strEq },
        'packageDownload.id'
      )
      query = filterByString(
        query,
        { eq: versionTag_strEq },
        'packageVersion.versionTag'
      )
      query = filterByString(
        query,
        { eq: versionId_strEq },
        'packageDownload.versionId'
      )
      query = filterByString(
        query,
        { eq: packageId_strEq },
        'package.id'
      )
      query = filterByString(
        query,
        { eq: packageName_strEq },
        'package.name'
      )
      query = filterByString(
        query,
        { eq: userId_strEq },
        'user.id'
      )
      query = filterByString(
        query,
        { eq: userEmail_strEq },
        'user.email'
      )
      query = filterByString(
        query,
        { eq: userFirstName_strEq },
        'user.firstName'
      )
      query = filterByString(
        query,
        { eq: userLastName_strEq },
        'user.lastName'
      )
      query = filterByString(
        query,
        { eq: ip_strEq },
        'packageDownload.ip'
      )

      query = filterByDate(
        query,
        {
          after: createdAt_after,
          before: createdAt_before
        },
        'packageDownload.createdAt'
      )

      query = filterBySearchName(
        query,
        {
          search: packageName_nameSearch
        },
        'package.name'
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
          search: userFirstName_nameSearch
        },
        'user.firstName'
      )

      query = filterBySearchName(
        query,
        {
          search: userLastName_nameSearch
        },
        'user.lastName'
      )

      query = filterBySearchName(
        query,
        {
          search: userEmail_nameSearch
        },
        'user.email'
      )

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'packageDownload.id'
      })

      const results = await query.execute()

      return createGetResult(results, page, perPage)
    }
  )
}
