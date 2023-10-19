import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import type { OrganizationRolePermissionTable, Permission } from '../../db/models/OrganizationRolePermission'
import { getOrgIdsFromOrgRoleIds } from '../../db/queries/getOrgIdsFromOrgRoleIds'
import { applyGetSettings, convertSortOrder } from '../../db/queryBuilders/applyGetSettings'
import { InvalidQueryScopeError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasOrgPermissions } from '../../util/assertUserHasOrgPermissions'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import {
  OrganizationRoleAssigneeCount, OrganizationRoleCreatedAt,
  OrganizationRoleDescription,
  OrganizationRoleId,
  OrganizationRoleName,
  OrganizationRoleOrganizationId,
  OrganizationRolePermissions,
  OrganizationRoleUpdatedAt
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
  id: OrganizationRoleId,
  organizationId: OrganizationRoleOrganizationId,
  name: OrganizationRoleName,
  description: OrganizationRoleDescription,
  updatedAt: OrganizationRoleUpdatedAt,
  createdAt: OrganizationRoleCreatedAt,
  isCustom: Type.Boolean({ description: 'Iff true, the role is available only to this organization. Derived from `organizationId`.' }),
  activeAssigneeCount: OrganizationRoleAssigneeCount
}
const Result = Type.Object({
  ...ResultProperties,
  permissions: OrganizationRolePermissions
})
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by', 'organizationId')

const filters = {
  organizationId: 'string' as const
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
const requiredPermissions = { oneOf: ['read:membership', 'write:membership'] as Permission[] }
async function assertHasPermission (req: FastifyRequest, orgId?: string, roleIds?: string[]) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    if (orgId !== undefined) {
      await assertUserHasOrgPermissions(req, orgId, requiredPermissions)
    } else if (roleIds !== undefined) {
      const orgIds = await getOrgIdsFromOrgRoleIds(roleIds)
      await Promise.all(orgIds.map(id => assertUserHasOrgPermissions(req, id, requiredPermissions)))
    } else {
      throw new InvalidQueryScopeError('Query too broad. Must specify at least one of the following query params: ids, organizationId_strEq')
    }
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetOrganizationRolesRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/organization-roles',
    {
      schema: {
        description: 'Returns a list of organizations roles based on the given filters',
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
        organizationId_strEq
      } = req.query

      await assertHasPermission(req, organizationId_strEq, ids)

      const db = await getDB()

      let query = db.with(
        'role', qb => qb.selectFrom('organizationRole')
          .leftJoin(
            eb => eb
              .selectFrom('userOrganization')
              .selectAll()
              .where('userOrganization.deletedAt', 'is', null) // we don't want to include non-active users in the assignee count
              .$if(organizationId_strEq !== undefined, qb => qb.where('userOrganization.organizationId', '=', organizationId_strEq ?? ''))
              .as('members'),
            join => join.onRef('members.roleId', '=', 'organizationRole.id')
          )
          .select(eb => [
            'organizationRole.id as id',
            'organizationRole.name as name',
            'organizationRole.organizationId as organizationId',
            'organizationRole.createdAt as createdAt',
            'organizationRole.updatedAt as updatedAt',
            'organizationRole.description as description',
            eb('organizationRole.organizationId', 'is not', null).as('isCustom'),
            eb.fn.count<number>('members.id').distinct().as('activeAssigneeCount')
          ])
          .$if(ids !== undefined, qb => qb.where('organizationRole.id', 'in', ids ?? []))
          .$if(organizationId_strEq !== undefined, qb => qb
            .where(({ eb, or }) => or([
              eb('organizationRole.organizationId', '=', organizationId_strEq ?? ''),
              eb('organizationRole.organizationId', 'is', null) // every org has access to roles where the organizationId is null (global roles)
            ]))
          )
          .groupBy('organizationRole.id')

          // For performance reasons, we need to do this sorting and limiting in the CTE;
          // however, we cannot use our standard settings function for some reason as it drops the
          // type info from the returning qb
          .$if(sortField !== undefined, qb => qb.orderBy(`${sortField ?? 'id'}`, convertSortOrder(sortOrder)))
          .$if(sortField !== 'isCustom', qb => qb.orderBy('isCustom'))
          .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
          .limit(perPage)
          .offset(page * perPage)

      ).selectFrom('role')
        .innerJoin('organizationRolePermission', 'role.id', 'organizationRolePermission.organizationRoleId')
        .select(eb => [
          'role.id as id',
          'role.name as name',
          'role.organizationId as organizationId',
          'role.createdAt as createdAt',
          'role.updatedAt as updatedAt',
          'role.description as description',
          'role.isCustom as isCustom',
          'role.activeAssigneeCount as activeAssigneeCount',
          eb.fn.agg<OrganizationRolePermissionTable['permission'][]>('array_agg', ['organizationRolePermission.permission']).as('permissions')
        ])
        .groupBy([
          'role.id',
          'role.name',
          'role.organizationId',
          'role.isCustom',
          'role.activeAssigneeCount',
          'role.createdAt',
          'role.updatedAt',
          'role.description'
        ])
        .$if(sortField !== 'isCustom', qb => qb.orderBy('isCustom'))

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'role.id'
      })

      const results = await query.execute()
      return createGetResult(results, page, perPage)
    }
  )
}
