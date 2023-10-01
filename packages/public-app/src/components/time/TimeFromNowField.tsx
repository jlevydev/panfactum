import Tooltip from '@mui/material/Tooltip'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)

export default function TimeFromNowField (props: {unixSeconds?: number | null, className?: string}) {
  const { unixSeconds, className = '' } = props
  const time = unixSeconds ? dayjs.unix(unixSeconds) : null
  return (
    <div className={className}>
      {time
        ? (
          <Tooltip title={time.local().format('ddd MM/DD/YYYY hh:mm:ss a Z')}>
            <div>
              {time.fromNow()}
            </div>
          </Tooltip>
        )
        : '-'}
    </div>
  )
}
