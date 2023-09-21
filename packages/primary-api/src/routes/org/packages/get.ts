// import type { FastifyPluginAsync } from 'fastify'
// import type { Static } from '@sinclair/typebox'
// import { DEFAULT_SCHEMA_CODES } from '../../constants'
// import { User } from './types'
// import { convertSortOrder, createGetReplyType, createQueryString, GetQueryString } from '../../types'
// import { getDB } from '../../../db/db'
// import { StringEnum } from '../../../util/customTypes'
// import type { OrgParamsType } from '../types'
// import { OrgParams } from '../types'
//
// /**********************************************************************
//  * Typings
//  **********************************************************************/
//
// const sortFields = StringEnum([
//   'id'
// ], 'id')
// const filters = {}
// export const GetPackagesQueryString = createQueryString(
//   filters,
//   sortFields
// )
// export type GetPackagesQueryStringType = GetQueryString<typeof sortFields, typeof filters>
//
// export const GetPackagesReply = createGetReplyType(User)
// export type GetPackagesReplyType = Static<typeof GetPackagesReply>
//
// /**********************************************************************
//  * Route Logic
//  **********************************************************************/
//
// export const GetPackagesRoute:FastifyPluginAsync = async (fastify) => {
//   void fastify.get<{Params:OrgParamsType, Querystring: GetPackagesQueryStringType, Reply: GetPackagesReplyType}>(
//     '/packages',
//     {
//       schema: {
//         querystring: GetPackagesQueryString,
//         params: OrgParams,
//         response: {
//           200: GetPackagesReply,
//           ...DEFAULT_SCHEMA_CODES
//         },
//         security: [{ cookie: [] }]
//       }
//     },
//     async (req) => {
//       const {
//         ids
//       } = req.query
//
//       const db = await getDB()
//       const users = await db.selectFrom('user')
//         .innerJoin('userOrganization', 'user.id', 'userOrganization.userId')
//         .select([
//           'user.id as id',
//           'user.firstName as firstName',
//           'user.lastName as lastName',
//           'user.email as email',
//           'user.createdAt as createdAt',
//           db.fn.count<number>('userOrganization.organizationId').as('numberOfOrgs')
//         ])
//         .groupBy('user.id')
//         .$if(Boolean(ids), qb => qb.where('user.id', 'in', ids ?? []))
//         .orderBy(`${sortField}`, convertSortOrder(sortOrder))
//         .limit(perPage)
//         .offset(page * perPage)
//         .execute()
//       return {
//         data: users.map(user => ({
//           ...user,
//           createdAt: Math.floor(user.createdAt.getTime() / 1000)
//         })),
//         pageInfo: {
//           hasPreviousPage: page !== 0,
//           hasNextPage: users.length >= perPage
//         }
//       }
//     }
//   )
// }
