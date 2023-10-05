import type { GridRenderCellParams } from '@mui/x-data-grid-pro'
import type { LoginSessionResultType } from '@panfactum/primary-api'

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
    <DataGrid<LoginSessionResultType>
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
            hidden: true
          },
          {
            field: 'masqueradingUserId',
            headerName: 'Masquerading User',
            type: 'stringOrNull',
            hidden: true
          },
          {
            field: 'createdAt',
            headerName: 'Started',
            type: 'dateTime'
          },
          {
            field: 'lastApiCallAt',
            headerName: 'Last Activity',
            type: 'dateTime'
          },
          {
            field: 'length',
            headerName: 'Length',
            type: 'computed',
            renderCell: (params: GridRenderCellParams<LoginSessionResultType, string>) => {
              return (
                <DurationField
                  fromUnixSeconds={params.row.createdAt}
                  toUnixSeconds={params.row.lastApiCallAt}
                />
              )
            }
          }
        ]
      }}
    />
  )
}
