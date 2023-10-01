import Tooltip from '@mui/material/Tooltip'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

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
