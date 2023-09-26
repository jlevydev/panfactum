import {
  BooleanInput, Datagrid, FilterButton, FilterForm,
  FunctionField, InfiniteList,
  TextField
} from 'react-admin'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import DurationField from '@/components/time/DurationField'
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)

const Filters = [
  <BooleanInput
    label="Is Active"
    source="isActive"
    key="isActive"
    defaultValue={true}
  />
]

function UserListActions () {
  return (
    <div className="flex justify-between w-full">
      <FilterForm filters={Filters} />
      <div className="flex">
        <FilterButton
          filters={Filters}
          className="flex-grow"
        />
      </div>
    </div>
  )
}

interface IAllUserLoginSessions {
  userId: string;
}
export default function AllUserLoginSessions (props: IAllUserLoginSessions) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allLoginSessions"
        filter={{ userId: props.userId }}
        sort={{ field: 'createdAt', order: 'DESC' }}
        actions={<UserListActions/>}
        empty={<div>No associated sessions</div>}
        perPage={25}
        component={'div'}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(id) => `${id}/basic`}
          optimized
        >
          <TextField
            source="id"
            label="ID"
          />
          <FunctionField
            source="masqueradingUserId"
            label="Masquerading User"
            render={(record: {masqueradingUserId: string | null}) => (
              <div>
                {record.masqueradingUserId ? record.masqueradingUserId : '-'}
              </div>
            )}
          />
          <FunctionField
            source="createdAt"
            label="Started At"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="lastApiCallAt"
            label="Last Activity At"
            render={(record: {lastApiCallAt: number | null}) => <TimeFromNowField unixSeconds={record.lastApiCallAt}/>}
          />

          <FunctionField
            label="Length"
            render={(record: {lastApiCallAt: number | null, createdAt: number}) => (
              <DurationField
                fromUnixSeconds={record.createdAt}
                toUnixSeconds={record.lastApiCallAt}
              />
            )}
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
