import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import type { ExpressionBuilder } from 'kysely'
import { sql } from 'kysely'

import { getDB } from '../../db/db'
import type { Database } from '../../db/models/Database'
import { getOrgInfoById } from '../../db/queries/getOrgInfoById'
import { getPackageInfoById } from '../../db/queries/getPackageInfoById'
import { Errors, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertPanfactumRoleFromSession } from '../../util/assertPanfactumRoleFromSession'
import { getJSONFromSettledPromises } from '../../util/getJSONFromSettledPromises'
import {
  PackageArchivedAt, PackageDeletedAt, PackageDescription, PackageHomepageUrl,
  PackageId, PackageIsArchived, PackageIsDeleted, PackageRepositoryUrl, PackageUpdatedAt
} from '../models/package'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  isArchived: Type.Optional(Type.Boolean({ description: 'Whether to archive or restore this package.' })),
  description: Type.Optional(PackageDescription),
  repositoryUrl: Type.Optional(PackageRepositoryUrl),
  homepageUrl: Type.Optional(PackageHomepageUrl),
  documentationUrl: Type.Optional(PackageHomepageUrl)
}, { additionalProperties: false })
export type DeltaType = Static<typeof Delta>

const UpdateBody = Type.Object({
  ids: Type.Array(PackageId),
  delta: Delta
})
export type UpdateBodyType = Static<typeof UpdateBody>

const UpdateResult = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    id: PackageId,
    archivedAt: PackageArchivedAt,
    deletedAt: PackageDeletedAt,
    updatedAt: PackageUpdatedAt,
    isDeleted: PackageIsDeleted,
    isArchived: PackageIsArchived
  })
])
export type UpdateResultType = Static<typeof UpdateResult>

export const UpdateReply = Type.Array(UpdateResult)
export type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

function standardReturn (eb: ExpressionBuilder<Database, 'package'>) {
  return [
    'id',
    'archivedAt',
    'deletedAt',
    'description',
    'repositoryUrl',
    'documentationUrl',
    'homepageUrl',
    'updatedAt',
    eb('deletedAt', 'is not', null).as('isDeleted'),
    eb('archivedAt', 'is not', null).as('isArchived')
  ] as const
}

async function update (versionId: string, delta:DeltaType) {
  const db = await getDB()
  return db
    .updateTable('package')
    .set({
      updatedAt: sql`NOW()`,
      documentationUrl: delta.documentationUrl,
      homepageUrl: delta.homepageUrl,
      repositoryUrl: delta.repositoryUrl,
      description: delta.description
    })
    .where('id', '=', versionId)
    .returning(standardReturn)
    .executeTakeFirst()
}

async function archive (versionId: string) {
  const db = await getDB()

  // When we archive a package,
  // we also archive all of the package versions
  try {
    await db
      .updateTable('packageVersion')
      .set({
        archivedAt: sql`NOW()`
      })
      .where('packageVersion.packageId', '=', versionId)
      .where('packageVersion.archivedAt', 'is', null)
      .execute()
  } catch (e) {
    throw new UnknownServerError('Unable archive package versions. Canceling archival.')
  }

  return db
    .updateTable('package')
    .set({
      archivedAt: sql`NOW()`
    })
    .where('id', '=', versionId)
    .returning(standardReturn)
    .executeTakeFirst()
}

async function restore (versionId: string) {
  const db = await getDB()
  return db
    .updateTable('package')
    .set({
      archivedAt: null
    })
    .where('id', '=', versionId)
    .returning(standardReturn)
    .executeTakeFirst()
}

/**********************************************************************
 * Single Mutation
 **********************************************************************/
async function applyMutation (id: string, delta: DeltaType) {
  const currentInfo = await getPackageInfoById(id)
  if (currentInfo === undefined) {
    throw new InvalidRequestError('This package does not exist.', Errors.PackageDoesNotExist, id)
  }

  if (currentInfo.isDeleted) {
    throw new InvalidRequestError('Cannot update package that has been deleted.', Errors.PackageDeleted, id)
  } else if (currentInfo.isArchived) {
    if (delta.isArchived === false) {
      const orgInfo = await getOrgInfoById(currentInfo.organizationId)
      if (!orgInfo) {
        throw new InvalidRequestError('Organization does not exist for package.', Errors.OrganizationDoesNotExist, id)
      } else if (orgInfo.isDeleted) {
        throw new InvalidRequestError('Cannot restore a package for a deleted organization.', Errors.OrganizationDeleted, id)
      }
      const result = await restore(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown issue occurred during restore.', id)
      }
      return result
    } else {
      throw new InvalidRequestError('Cannot update package that has been archived.', Errors.PackagedArchived, id)
    }
  } else {
    if (delta.isArchived === true) {
      const result = await archive(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown issue occurred during archiving.', id)
      }
      return result
    } else {
      const result = await update(id, delta)
      if (result === undefined) {
        throw new UnknownServerError('Unknown issue occurred during update.', id)
      }
      return result
    }
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdatePackagesRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/packages',
    {
      schema: {
        description: 'Applies package patches and returns the updated package objects',
        body: UpdateBody,
        response: {
          200: UpdateReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      await assertPanfactumRoleFromSession(req, 'admin')

      const { ids, delta } = req.body
      console.log(delta)
      const results = await Promise.allSettled(ids.map(id => applyMutation(id, delta)))
      return getJSONFromSettledPromises(results)
    }
  )
}
