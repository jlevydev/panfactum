import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import type { ExpressionBuilder } from 'kysely'
import { sql } from 'kysely'

import { getDB } from '../../db/db'
import type { Database } from '../../db/models/Database'
import { getPackageInfoById } from '../../db/queries/getPackageInfoById'
import { getPackageVersionInfoById } from '../../db/queries/getPackageVersionInfoById'
import { Errors, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertPanfactumRoleFromSession } from '../../util/assertPanfactumRoleFromSession'
import { getJSONFromSettledPromises } from '../../util/getJSONFromSettledPromises'
import {
  PackageVersionArchivedAt,
  PackageVersionDeletedAt,
  PackageVersionId, PackageVersionIsArchived,
  PackageVersionIsDeleted
} from '../models/package'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  isArchived: Type.Optional(Type.Boolean({ description: 'Whether to archive or restore this package version.' }))
}, { additionalProperties: true })
export type DeltaType = Static<typeof Delta>

const UpdateBody = Type.Object({
  ids: Type.Array(PackageVersionId),
  delta: Delta
})
export type UpdateBodyType = Static<typeof UpdateBody>

const UpdateResult = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    id: PackageVersionId,
    archivedAt: PackageVersionArchivedAt,
    deletedAt: PackageVersionDeletedAt,
    isDeleted: PackageVersionIsDeleted,
    isArchived: PackageVersionIsArchived
  })
])
export type UpdateResultType = Static<typeof UpdateResult>

export const UpdateReply = Type.Array(UpdateResult)
export type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

function standardReturn (eb: ExpressionBuilder<Database, 'packageVersion'>) {
  return [
    'id',
    'archivedAt',
    'deletedAt',
    eb('deletedAt', 'is not', null).as('isDeleted'),
    eb('archivedAt', 'is not', null).as('isArchived')
  ] as const
}

async function noop (versionId: string) {
  const db = await getDB()
  return db
    .selectFrom('packageVersion')
    .select(standardReturn)
    .where('id', '=', versionId)
    .executeTakeFirst()
}

async function archive (versionId: string) {
  const db = await getDB()
  return db
    .updateTable('packageVersion')
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
    .updateTable('packageVersion')
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
  const currentInfo = await getPackageVersionInfoById(id)
  if (currentInfo === undefined) {
    throw new InvalidRequestError('This package version does not exist.', Errors.PackageVersionDoesNotExist, id)
  }

  if (currentInfo.isDeleted) {
    throw new InvalidRequestError('Cannot update package version that has been deleted.', Errors.PackageVersionDeleted, id)
  } else if (currentInfo.isArchived) {
    if (delta.isArchived === false) {
      const packageInfo = await getPackageInfoById(currentInfo.packageId)
      if (!packageInfo) {
        throw new InvalidRequestError('Package does not exist for package version.', Errors.PackageDoesNotExist, id)
      } else if (packageInfo.isDeleted) {
        throw new InvalidRequestError('Cannot restore a package version for a deleted package.', Errors.PackageDeleted, id)
      } else if (packageInfo.isArchived) {
        throw new InvalidRequestError('Cannot restore a package version for an archived package. Restore the package first.', Errors.PackagedArchived, id)
      }
      const result = await restore(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown issue occurred during restore.', id)
      }
      return result
    } else {
      throw new InvalidRequestError('Cannot update package version that has been archived.', Errors.PackageVersionArchived, id)
    }
  } else {
    if (delta.isArchived === true) {
      const result = await archive(id)
      if (result === undefined) {
        throw new UnknownServerError('Unknown issue occurred during archiving.', id)
      }
      return result
    } else {
      const result = await noop(id)
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

export const UpdatePackageVersionsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/package-versions',
    {
      schema: {
        description: 'Applies package patches and returns the updated package objects',
        body: Delta,
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
      const results = await Promise.allSettled(ids.map(id => applyMutation(id, delta)))
      return getJSONFromSettledPromises(results)
    }
  )
}
