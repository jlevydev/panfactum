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
 * Root
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
    field: 'createdAt',
    headerName: 'Time',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'packageName',
    headerName: 'Name',
    description: 'The package name',
    type: 'string',
    filter: 'name'
  },
  {
    field: 'versionTag',
    headerName: 'Version',
    type: 'string',
    filter: 'name'
  },
  {
    field: 'ip',
    headerName: 'IP',
    type: 'ip',
    filter: 'string'
  }
]

interface PageProps {
  params: {userId: string;}
}
export default memo(function Page ({ params: { userId } }: PageProps) {
  const router = useRouter()
  const handleRowClick = useCallback((record: PackageDownloadResultType) => {
    router.push(`/a/admin/packages/${record.id}`)
  }, [router])

  const permanentFilters = useMemo(() => ([
    { field: 'userId' as const, operator: 'strEq' as const, value: userId }
  ]), [userId])

  return (
    <DataGrid<PackageDownloadResultType, PackageDownloadSortType, PackageDownloadFiltersType>
      useGetList={useGetListPackageDownload}
      onRowClick={handleRowClick}
      empty={<div>No associated package downloads</div>}
      permanentFilters={permanentFilters}
      columns={columns}
    />
  )
})
