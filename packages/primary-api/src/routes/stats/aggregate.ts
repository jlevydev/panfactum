import type { RouteOptions } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

import { StatsType, BrandIndustry, CreatorReach, DealType } from './types'
import { getLabelsByStatsType } from './util'

/**********************************************************************
 * Typings
 **********************************************************************/

export const AggregateStatsParams = Type.Object({
  type: Type.Enum(StatsType)
})
export const AggregateStatsReturnType = Type.Object({
  data: Type.Array(Type.Array(Type.Number(), { minItems: 5, maxItems: 5 })),
  labels: Type.Array(Type.String())
})

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AggregateStatsRoute: RouteOptions = {
  method: 'GET',
  url: '/stats/aggregate/:type',
  handler: (req): Static<typeof AggregateStatsReturnType> => {
    const params = req.params as Static<typeof AggregateStatsParams>

    return {
      labels: getLabelsByStatsType(params.type),
      data: [
        [800, 900, 1000, 1100, 2000],
        [800, 900, 1000, 1100, 2000],
        [800, 900, 1000, 1100, 2000],
        [800, 900, 1000, 1100, 2000],
        [800, 900, 1000, 1100, 2000]
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
    params: AggregateStatsParams,
    response: {
      200: AggregateStatsReturnType
    }
  }
}
