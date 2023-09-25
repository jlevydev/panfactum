import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import Tooltip from '@mui/material/Tooltip'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)

interface IDurationField {
  fromUnixSeconds?: number | null;
  toUnixSeconds?: number | null;
}
export default function DurationField (props: IDurationField) {
  const { fromUnixSeconds, toUnixSeconds } = props
  const duration = fromUnixSeconds && toUnixSeconds ? dayjs.duration(toUnixSeconds - fromUnixSeconds, 'seconds') : null
  return (
    <div>
      {duration
        ? (
          <Tooltip title={duration.format('DD[d] HH[h] mm[m] ss[s]')}>
            <div>
              {duration.humanize()}
            </div>
          </Tooltip>
        )
        : '-'}
    </div>
  )
}
