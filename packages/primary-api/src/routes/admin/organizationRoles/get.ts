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
import {
  OrganizationRoleAssigneeCount,
  OrganizationRoleId, OrganizationRoleName, OrganizationRoleOrganizationId, OrganizationRolePermissions
} from '../../models/organization'
import { Type } from '@sinclair/typebox'
import type { OrganizationRolePermissionTable } from '../../../db/models/OrganizationRolePermission'
/**********************************************************************
 * Typings
 **********************************************************************/
const Result = Type.Object({
  id: OrganizationRoleId,
  organizationId: OrganizationRoleOrganizationId,
  name: OrganizationRoleName,
  permissions: OrganizationRolePermissions,
  isCustom: Type.Boolean({ description: 'Iff true, the role is available only to this organization. Derived from `organizationId`.' }),
  activeAssigneeCount: OrganizationRoleAssigneeCount
})

const sortFields = StringEnum([
  'id',
  'organizationId',
  'name',
  'isCustom',
  'activeAssigneeCount'
], 'The field to sort by', 'organizationId')
const filters = {
  organizationId: Type.String({ format: 'uuid', description: 'Return only roles for this organization' })
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
      await assertPanfactumRoleFromSession(req, 'admin')

      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        organizationId
      } = req.query

      const db = await getDB()

      const results = await db.with(
        'role', qb => qb.selectFrom('organizationRole')
          .leftJoin(
            eb => eb
              .selectFrom('userOrganization')
              .selectAll()
              .where('userOrganization.deletedAt', 'is', null) // we don't want to include non-active users in the assignee count
              .$if(organizationId !== undefined, qb => qb.where('userOrganization.organizationId', '=', organizationId ?? ''))
              .as('members'),
            join => join.onRef('members.roleId', '=', 'organizationRole.id')
          )
          .select(eb => [
            'organizationRole.id as id',
            'organizationRole.name as name',
            'organizationRole.organizationId as organizationId',
            eb('organizationRole.organizationId', 'is not', null).as('isCustom'),
            eb.fn.count<number>('members.id').distinct().as('activeAssigneeCount')
          ])
          .$if(ids !== undefined, qb => qb.where('organizationRole.id', 'in', ids ?? []))
          .$if(organizationId !== undefined, qb => qb
            .where(({ eb, or }) => or([
              eb('organizationRole.organizationId', '=', organizationId ?? ''),
              eb('organizationRole.organizationId', 'is', null) // every org has access to roles where the organizationId is null (global roles)
            ]))
          )
          .groupBy('organizationRole.id')
          .orderBy(`${sortField}`, convertSortOrder(sortOrder))
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
          'role.isCustom as isCustom',
          'role.activeAssigneeCount as activeAssigneeCount',
          eb.fn.agg<OrganizationRolePermissionTable['permission'][]>('array_agg', ['organizationRolePermission.permission']).as('permissions')
        ])
        .groupBy(['role.id', 'role.name', 'role.organizationId', 'role.isCustom', 'role.activeAssigneeCount'])
        .orderBy(`${sortField}`, convertSortOrder(sortOrder)) // We need to sort again due to the CTE
        .$if(sortField !== 'isCustom', qb => qb.orderBy('isCustom'))
        .$if(sortField !== 'id', qb => qb.orderBy('id'))
        .execute()

      return {
        data: results.map(result => ({
          ...result,
          isCustom: Boolean(result.isCustom)
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: results.length >= perPage
        }
      }
    }
  )
}
