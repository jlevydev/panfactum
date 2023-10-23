'use client'

import type {
  LoginSessionFiltersType,
  LoginSessionResultType, LoginSessionSortType
} from '@panfactum/primary-api'
import React, { memo, useMemo } from 'react'

import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import DurationField from '@/components/fields/time/DurationField'
import { useGetListLoginSession } from '@/lib/hooks/queries/crud/loginSessions'

/************************************************
 * Root
 * **********************************************/

const columns: CustomColDef<LoginSessionResultType, LoginSessionFiltersType>[] = [
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

interface PageProps {
  params: {userId: string;}
}
export default memo(function Page ({ params: { userId } }: PageProps) {
  const permanentFilters = useMemo(() => ([
    { field: 'userId' as const, operator: 'strEq' as const, value: userId }
  ]), [userId])

  return (
    <DataGrid<LoginSessionResultType, LoginSessionSortType, LoginSessionFiltersType>
      useGetList={useGetListLoginSession}
      empty={<div>No associated sessions</div>}
      permanentFilters={permanentFilters}
      columns={columns}
    />
  )
})
