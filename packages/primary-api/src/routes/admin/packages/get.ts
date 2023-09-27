import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import type { Static } from '@sinclair/typebox'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import {
  convertSortOrder,
  createGetReplyType,
  createQueryString,
  GetQueryString
} from '../../types'
import { getDB } from '../../../db/db'
import { StringEnum } from '../../../util/customTypes'
import { Type } from '@sinclair/typebox'
import {
  PackageActiveVersionCount,
  PackageArchivedAt,
  PackageCreatedAt, PackageDeletedAt,
  PackageDescription, PackageDocumentationUrl, PackageHomepageUrl,
  PackageId, PackageIsArchived, PackageIsDeleted, PackageIsPublished, PackageLastPublishedAt,
  PackageName,
  PackageOrganizationId,
  PackageRepositoryUrl, PackageType, PackageUpdatedAt
} from '../../models/package'
import { OrganizationName } from '../../models/organization'
import { DEFAULT_SCHEMA_CODES } from '../../../handlers/error'
import { createGetResult } from '../../../util/createGetResult'

/**********************************************************************
 * Typings
 **********************************************************************/
const Result = Type.Object({
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
})
export type ResultType = Static<typeof Result>

const sortFields = StringEnum([
  'id',
  'organizationId',
  'organizationName',
  'name',
  'packageType',
  'createdAt',
  'archivedAt',
  'deletedAt',
  'updatedAt',
  'activeVersionCount',
  'lastPublishedAt',
  'isPublished'
], 'The field to sort by', 'name')
const filters = {
  organizationId: Type.String({ format: 'uuid', description: 'Return only packages for this organization' }),
  packageType: PackageType,
  isDeleted: Type.Boolean({ description: 'If provided, filters the result set depending on whether each package has been deleted.' }),
  isArchived: Type.Boolean({ description: 'If provided, filters the result set depending on whether each package has been archived.' })
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
      await assertPanfactumRoleFromSession(req, 'admin')

      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        organizationId,
        packageType,
        isDeleted,
        isArchived
      } = req.query

      const db = await getDB()

      const results = await db.selectFrom('package')
        .innerJoin('organization', 'organization.id', 'package.organizationId')
        .innerJoin('packageVersion', 'packageVersion.packageId', 'package.id')
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
          eb.fn.count<number>('packageVersion.id').distinct().as('activeVersionCount'),
          // There is an issue with the kysely typings that doesn't allow max on a Date field even
          // though it is valid sql, so we use an `any` escape hatch
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
          eb.fn.max<number>('packageVersion.createdAt' as any).as('lastPublishedAt'),
          eb(eb.fn.count<number>('packageVersion.id').distinct(), '>', 0).as('isPublished')
        ])
        .where('packageVersion.archivedAt', 'is', null) // we only count package versions that are not archived
        .$if(ids !== undefined, qb => qb.where('package.id', 'in', ids ?? []))
        .$if(organizationId !== undefined, qb => qb.where('package.organizationId', '=', organizationId ?? ''))
        .$if(packageType !== undefined, qb => qb.where('package.packageType', 'in', packageType ? [packageType] : []))
        .$if(isDeleted !== undefined, qb => qb.where('package.deletedAt', isDeleted ? 'is not' : 'is', null))
        .$if(isArchived !== undefined, qb => qb.where('package.archivedAt', isArchived ? 'is not' : 'is', null))
        .groupBy(['package.id', 'organization.id'])
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()

      return createGetResult(results, page, perPage)
    }
  )
}
