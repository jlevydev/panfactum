import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertPanfactumRoleFromSession } from '../../util/assertPanfactumRoleFromSession'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
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
})
export type ResultType = Static<typeof Result>

const sortFields = StringEnum([
  'id',
  'packageId',
  'packageName',
  'packageType',
  'versionTag',
  'sizeBytes',
  'createdBy',
  'createdAt',
  'archivedAt',
  'deletedAt',
  'downloadCount'
], 'The field to sort by', 'createdAt')
const filters = {
  packageId: Type.String({ format: 'uuid', description: 'Return only versions for this package' }),
  isDeleted: Type.Boolean({ description: 'If provided, filters the result set depending on whether each package version has been deleted.' }),
  isArchived: Type.Boolean({ description: 'If provided, filters the result set depending on whether each package version has been archived.' })
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
      await assertPanfactumRoleFromSession(req, 'admin')

      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        packageId,
        isDeleted,
        isArchived
      } = req.query

      const db = await getDB()

      // Todo: The download count operation here is _VERY_ expensive due to the amount
      // of rows that need to be traversed. At even moderate, this will need to be memoized.
      const results = await db.with(
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
        .$if(ids !== undefined, qb => qb.where('packageVersion.id', 'in', ids ?? []))
        .$if(isDeleted !== undefined, qb => qb.where('packageVersion.deletedAt', isDeleted ? 'is not' : 'is', null))
        .$if(isArchived !== undefined, qb => qb.where('packageVersion.archivedAt', isArchived ? 'is not' : 'is', null))
        .$if(packageId !== undefined, qb => qb.where('packageVersion.packageId', '=', packageId ?? ''))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()

      return createGetResult(results, page, perPage)
    }
  )
}
