import { StatsType } from './types'
import { EFFORT_BUCKETS, SELLOUT_BUCKETS, TEAM_SIZE_BUCKETS, VIDEO_COUNT_BUCKETS } from './constants'

export function getLabelsByStatsType (type: StatsType) {
  switch (type) {
  case StatsType.BY_COUNT:
    return VIDEO_COUNT_BUCKETS
  case StatsType.BY_EFFORT:
    return EFFORT_BUCKETS
  case StatsType.BY_TEAMSIZE:
    return TEAM_SIZE_BUCKETS
  case StatsType.BY_SELLOUT:
    return SELLOUT_BUCKETS
  }
}
