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
import { Type } from '@sinclair/typebox'
import {
  PackageDownloadCreatedAt,
  PackageDownloadId, PackageDownloadIP, PackageDownloadUserId, PackageDownloadVersionId, PackageId, PackageName,
  PackageVersionTag
} from '../../models/package'
import { UserEmail, UserFirstName, UserLastName } from '../../models/user'
/**********************************************************************
 * Typings
 **********************************************************************/
const Result = Type.Object({
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
})

const sortFields = StringEnum([
  'id',
  'versionId',
  'versionTag',
  'packageId',
  'packageName',
  'userId',
  'userFirstName',
  'userLastName',
  'userEmail',
  'ip',
  'createdAt'
], 'The field to sort by', 'createdAt')
const filters = {
  versionId: Type.String({ format: 'uuid', description: 'Return only downloads for this package version' }),
  packageId: Type.String({ format: 'uuid', description: 'Return only downloads for this package' }),
  userId: Type.String({ format: 'uuid', description: 'Return only downloads for this user' }),
  ip: Type.String({ format: 'ipv4', description: 'Return only downloads for this IP address' })
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
      await assertPanfactumRoleFromSession(req, 'admin')

      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        packageId,
        versionId,
        userId,
        ip
      } = req.query

      const db = await getDB()

      // Todo: The download count operation here is _VERY_ expensive due to the amount
      // of rows that need to be traversed. At even moderate, this will need to be memoized.
      const results = await db
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
        .$if(ids !== undefined, qb => qb.where('packageDownload.id', 'in', ids ?? []))
        .$if(versionId !== undefined, qb => qb.where('packageVersion.id', '=', versionId ?? ''))
        .$if(packageId !== undefined, qb => qb.where('package.id', '=', packageId ?? ''))
        .$if(userId !== undefined, qb => qb.where('user.id', '=', userId ?? ''))
        .$if(ip !== undefined, qb => qb.where('packageDownload.ip', '=', ip ?? ''))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()

      return {
        data: results.map(result => ({
          ...result,
          createdAt: dateToUnixSeconds(result.createdAt)
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: results.length >= perPage
        }
      }
    }
  )
}
