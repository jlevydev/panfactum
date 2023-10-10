import type { LoginSessionResultType, LoginSessionFiltersType } from '@panfactum/primary-api'

import DataGrid from '@/components/datagrid/DataGrid'
import DurationField from '@/components/fields/time/DurationField'

/************************************************
 * List
 * **********************************************/
interface IAllUserLoginSessions {
  userId: string;
}
export default function AllUserLoginSessions (props: IAllUserLoginSessions) {
  return (
    <DataGrid<LoginSessionResultType, LoginSessionFiltersType>
      listProps={{
        resource: 'loginSessions',
        filter: { userId: props.userId },
        sort: { field: 'createdAt', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No associated sessions</div>,
        columns: [
          {
            field: 'id',
            headerName: 'Session ID',
            type: 'string',
            hidden: true,
            filter: 'string'
          },
          {
            field: 'masqueradingUserId',
            headerName: 'Masquerading User',
            type: 'stringOrNull',
            hidden: true,
            filter: 'string'
          },
          {
            field: 'createdAt',
            headerName: 'Started',
            type: 'dateTime',
            filter: 'date'
          },
          {
            field: 'lastApiCallAt',
            headerName: 'Last Activity',
            type: 'dateTime',
            filter: 'date'
          },
          {
            field: 'length',
            headerName: 'Length',
            type: 'computed',
            render: ({ createdAt, lastApiCallAt }) => {
              return (
                <DurationField
                  fromUnixSeconds={createdAt}
                  toUnixSeconds={lastApiCallAt}
                />
              )
            }
          }
        ]
      }}
    />
  )
}
