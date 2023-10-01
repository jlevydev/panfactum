import {
  Datagrid,
  FunctionField, InfiniteList,
  TextField, TopToolbar
} from 'react-admin'

import DurationField from '@/components/time/DurationField'
import TimeFromNowField from '@/components/time/TimeFromNowField'

/************************************************
 * List Actions
 * **********************************************/

function Actions () {
  return (
    <TopToolbar/>
  )
}

/************************************************
 * List
 * **********************************************/
interface IAllUserLoginSessions {
  userId: string;
}
export default function AllUserLoginSessions (props: IAllUserLoginSessions) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="loginSessions"
        filter={{ userId: props.userId }}
        sort={{ field: 'createdAt', order: 'DESC' }}
        actions={<Actions/>}
        empty={<div>No associated sessions</div>}
        perPage={25}
        component={'div'}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={false}
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
