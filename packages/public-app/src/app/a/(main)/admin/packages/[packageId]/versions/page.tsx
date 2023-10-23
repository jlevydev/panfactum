'use client'

import type {

  PackageDownloadFiltersType,
  PackageDownloadResultType, PackageDownloadSortType
} from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback, useMemo } from 'react'

import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import { useGetListPackageDownload } from '@/lib/hooks/queries/crud/packageDownloads'

/************************************************
 * Page
 * **********************************************/

const columns: CustomColDef<PackageDownloadResultType, PackageDownloadFiltersType>[] = [
  {
    field: 'id',
    headerName: 'Download ID',
    type: 'string',
    hidden: true,
    filter: 'string'
  },
  {
    field: 'versionId',
    headerName: 'Version ID',
    type: 'string',
    hidden: true,
    filter: 'string'
  },
  {
    field: 'packageId',
    headerName: 'Package ID',
    type: 'string',
    hidden: true,
    filter: 'string'
  },
  {
    field: 'userId',
    headerName: 'User ID',
    type: 'string',
    hidden: true,
    filter: 'string'
  },
  {
    field: 'userFirstName',
    headerName: 'User First Name',
    type: 'string',
    hidden: true,
    filter: 'name'
  },
  {
    field: 'userLastName',
    headerName: 'User Last Name',
    type: 'string',
    hidden: true,
    filter: 'name'
  },
  {
    field: 'userEmail',
    headerName: 'User Email',
    type: 'string',
    hidden: true,
    filter: 'name'
  },
  {
    field: 'createdAt',
    headerName: 'Created',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'versionTag',
    headerName: 'Version',
    type: 'string',
    filter: 'name'
  },
  {
    field: 'createdBy',
    headerName: 'By',
    type: 'computed',
    render: ({ userFirstName, userLastName }) => {
      return (
        <div>
          {userFirstName}
          {' '}
          {userLastName}
        </div>
      )
    }
  },
  {
    field: 'ip',
    headerName: 'IP',
    type: 'ip',
    filter: 'string'
  }
]

interface PageProps {
  params: {packageId: string}
}

export default memo(function Page ({ params: { packageId } }: PageProps) {
  const router = useRouter()
  const handleRowClick = useCallback((download: PackageDownloadResultType) => {
    router.push(`/a/admin/users/${download.userId}`)
  }, [router])

  const permanentFilters = useMemo(() => ([
    { field: 'packageId' as const, operator: 'strEq' as const, value: packageId }
  ]), [packageId])

  return (
    <DataGrid<PackageDownloadResultType, PackageDownloadSortType, PackageDownloadFiltersType>
      empty={<div>No downloads found</div>}
      useGetList={useGetListPackageDownload}
      permanentFilters={permanentFilters}
      onRowClick={handleRowClick}
      columns={columns}
    />
  )
})
