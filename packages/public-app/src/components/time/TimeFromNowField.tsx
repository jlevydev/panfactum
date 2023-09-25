import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import Tooltip from '@mui/material/Tooltip'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)

export default function TimeFromNowField (props: {unixSeconds?: number | null}) {
  const { unixSeconds } = props
  const time = unixSeconds ? dayjs.unix(unixSeconds) : null
  return (
    <div>
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
