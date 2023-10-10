import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema, FastifyRequest } from 'fastify'
import { sql } from 'kysely'

import { getDB } from '../../db/db'
import { getOrgIdsFromOrgRoleIds } from '../../db/queries/getOrgIdsFromOrgRoleIds'
import { getOrgRoleInfoById } from '../../db/queries/getOrgRoleInfoById'
import { Errors, InvalidRequestError, UnknownServerError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import type { OrgPermissionCheck } from '../../util/assertUserHasOrgPermissions'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { getJSONFromSettledPromises } from '../../util/getJSONFromSettledPromises'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import { OrganizationRoleDescription, OrganizationRoleId, OrganizationRoleUpdatedAt } from '../models/organization'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  description: Type.Optional(OrganizationRoleDescription)
}, { additionalProperties: true })
export type DeltaType = Static<typeof Delta>

const UpdateBody = Type.Object({
  ids: Type.Array(OrganizationRoleId),
  delta: Delta
})
export type UpdateBodyType = Static<typeof UpdateBody>

const UpdateResult = Type.Composite([
  Type.Required(Delta),
  Type.Object({
    id: OrganizationRoleId,
    updatedAt: OrganizationRoleUpdatedAt
  })
])
export type UpdateResultType = Static<typeof UpdateResult>

export const UpdateReply = Type.Array(UpdateResult)
export type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Query Helpers
 **********************************************************************/

const requiredPermissions = { allOf: ['write:membership'] } as OrgPermissionCheck
async function assertHasPermission (req: FastifyRequest, roleIds: string[]) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    const orgIds = await getOrgIdsFromOrgRoleIds(roleIds)
    await Promise.all(orgIds.map(id => assertUserHasOrgPermissions(req, id, requiredPermissions)))
  }
}

function standardReturn () {
  return [
    'id',
    'description',
    'updatedAt'
  ] as const
}

async function update (roleId: string, delta:DeltaType) {
  const db = await getDB()
  return db
    .updateTable('organizationRole')
    .set({
      updatedAt: sql`NOW()`,
      description: delta.description
    })
    .where('id', '=', roleId)
    .returning(standardReturn)
    .executeTakeFirst()
}

/**********************************************************************
 * Single Mutation
 **********************************************************************/
async function applyMutation (id: string, delta: DeltaType) {
  const currentInfo = await getOrgRoleInfoById(id)
  if (currentInfo === undefined) {
    throw new InvalidRequestError('This role does not exist.', Errors.RoleDoesNotExist, id)
  }

  const result = await update(id, delta)
  if (result === undefined) {
    throw new UnknownServerError('Unknown error occurred when attempting to update the role.', id)
  }
  return result
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateOrganizationRolesRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/organization-roles',
    {
      schema: {
        description: 'Applies organization role patches and returns the updated organization role objects',
        body: Delta,
        response: {
          200: UpdateReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      const { ids, delta } = req.body
      await assertHasPermission(req, ids)
      const results = await Promise.allSettled(ids.map(id => applyMutation(id, delta)))
      return getJSONFromSettledPromises(results)
    }
  )
}
