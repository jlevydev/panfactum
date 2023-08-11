import type { RouteOptions } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

import { StatsType, BrandIndustry, CreatorReach, DealType } from './types'
import { getLabelsByStatsType } from './util'

/**********************************************************************
 * Typings
 **********************************************************************/

export const CreatorStatsParams = Type.Object({
  type: Type.Enum(StatsType),
  creatorId: Type.String()
})
export const CreatorStatsReturnType = Type.Object({
  data: Type.Array(Type.Array(Type.Number(), { minItems: 5, maxItems: 5 })),
  labels: Type.Array(Type.String())
})

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const CreatorStatsRoute: RouteOptions = {
  method: 'GET',
  url: '/stats/creator/:creatorId/:type',
  handler: (req): Static<typeof CreatorStatsReturnType> => {
    const params = req.params as Static<typeof CreatorStatsParams>

    return {
      labels: getLabelsByStatsType(params.type),
      data: [
        [1500, 1000, 1200, 2000],
        [1500, 1000, 1200, 2000],
        [1500, 1000, 1200, 2000],
        [1500, 1000, 1200, 2000],
        [750, 800, 900, 1000]
      ]
    }
  },
  schema: {
    querystring: {
      brandIndustry: Type.Enum(BrandIndustry, { default: BrandIndustry.ALL }),
      brandMatchesCreator: Type.Boolean({ default: false }),
      creatorReach: Type.Enum(CreatorReach, { default: CreatorReach.ALL }),
      dealType: Type.Enum(DealType, { default: DealType.ALL })
    },
    params: CreatorStatsParams,
    response: {
      200: CreatorStatsReturnType
    }
  }
}
