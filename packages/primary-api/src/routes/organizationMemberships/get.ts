import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import { getDB } from '../../db/db'
import { applyGetSettings } from '../../db/queryBuilders/applyGetSettings'
import { filterByBoolean } from '../../db/queryBuilders/filterByBoolean'
import { filterByDate } from '../../db/queryBuilders/filterByDate'
import { filterByHasTimeMarker } from '../../db/queryBuilders/filterByHasTimeMarker'
import { filterBySearchName } from '../../db/queryBuilders/filterBySearchName'
import { filterByString } from '../../db/queryBuilders/filterByString'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertPanfactumRoleFromSession } from '../../util/assertPanfactumRoleFromSession'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import {
  OrganizationId,
  OrganizationIsUnitary,
  OrganizationMembershipCreatedAt,
  OrganizationMembershipDeletedAt, OrganizationMembershipId,
  OrganizationMembershipIsDeleted,
  OrganizationName,
  OrganizationRoleId,
  OrganizationRoleName
} from '../models/organization'
import {
  UserEmail,
  UserFirstName,
  UserId, UserLastName
} from '../models/user'
import type { GetQueryString } from '../queryParams'
import {
  createGetReplyType,
  createQueryString
} from '../queryParams'

/**********************************************************************
 * Typings
 **********************************************************************/
const ResultProperties = {
  id: OrganizationMembershipId,
  userId: UserId,
  userFirstName: UserFirstName,
  userLastName: UserLastName,
  userEmail: UserEmail,
  organizationId: OrganizationId,
  organizationName: OrganizationName,
  roleId: OrganizationRoleId,
  roleName: OrganizationRoleName,
  isUnitary: OrganizationIsUnitary,
  createdAt: OrganizationMembershipCreatedAt,
  deletedAt: OrganizationMembershipDeletedAt,
  isDeleted: OrganizationMembershipIsDeleted
}
const Result = Type.Object(ResultProperties)
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by', 'organizationId')

const filters = {
  id: 'string' as const,
  userId: 'string' as const,
  userFirstName: 'name' as const,
  userLastName: 'name' as const,
  userEmail: 'name' as const,
  organizationId: 'string' as const,
  organizationName: 'name' as const,
  roleId: 'string' as const,
  roleName: 'string' as const,

  isUnitary: 'boolean' as const,
  isDeleted: 'boolean' as const,

  createdAt: 'date' as const,
  deletedAt: 'date' as const
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
 * Route Logic
 **********************************************************************/

export const GetOrganizationMemberships:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/organization-memberships',
    {
      schema: {
        description: 'Returns a list of organizations memberships based on the given filters',
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
        id_strEq,
        userId_strEq,
        userFirstName_strEq,
        userLastName_strEq,
        userEmail_strEq,
        organizationId_strEq,
        organizationName_strEq,
        roleId_strEq,
        roleName_strEq,

        userEmail_nameSearch,
        userLastName_nameSearch,
        userFirstName_nameSearch,
        organizationName_nameSearch,

        isUnitary_boolean,
        isDeleted_boolean,

        createdAt_after,
        createdAt_before,
        deletedAt_after,
        deletedAt_before
      } = req.query

      const db = await getDB()

      let query = db.selectFrom('userOrganization')
        .innerJoin('organization', 'organization.id', 'userOrganization.organizationId')
        .innerJoin('organizationRole', 'organizationRole.id', 'userOrganization.roleId')
        .innerJoin('user', 'user.id', 'userOrganization.userId')
        .select(eb => [
          'userOrganization.id as id',
          'userOrganization.userId as userId',
          'userOrganization.organizationId as organizationId',
          'userOrganization.createdAt as createdAt',
          'userOrganization.deletedAt as deletedAt',
          'organization.name as organizationName',
          'organization.isUnitary as isUnitary',
          'organizationRole.id as roleId',
          'organizationRole.name as roleName',
          'user.firstName as userFirstName',
          'user.lastName as userLastName',
          'user.email as userEmail',
          eb('userOrganization.deletedAt', 'is not', null).as('isDeleted')
        ])

      query = filterByString(
        query,
        { eq: id_strEq },
        'userOrganization.id'
      )
      query = filterByString(
        query,
        { eq: userId_strEq },
        'user.id'
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
        { eq: userEmail_strEq },
        'user.email'
      )
      query = filterByString(
        query,
        { eq: organizationId_strEq },
        'organization.id'
      )
      query = filterByString(
        query,
        { eq: organizationName_strEq },
        'organization.name'
      )
      query = filterByString(
        query,
        { eq: roleId_strEq },
        'organizationRole.id'
      )
      query = filterByString(
        query,
        { eq: roleName_strEq },
        'organizationRole.name'
      )

      console.log('isUnitary', isUnitary_boolean)
      query = filterByBoolean(
        query,
        { is: isUnitary_boolean },
        'organization.isUnitary'
      )
      query = filterByHasTimeMarker(
        query,
        { has: isDeleted_boolean },
        'userOrganization.deletedAt'
      )

      query = filterByDate(
        query,
        {
          before: createdAt_before,
          after: createdAt_after
        },
        'userOrganization.createdAt'
      )
      query = filterByDate(
        query,
        {
          before: deletedAt_before,
          after: deletedAt_after
        },
        'userOrganization.deletedAt'
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

      query = filterBySearchName(
        query,
        {
          search: organizationName_nameSearch
        },
        'organization.name'
      )

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'userOrganization.id'
      })

      const results = await query.execute()

      return createGetResult(results, page, perPage)
    }
  )
}
