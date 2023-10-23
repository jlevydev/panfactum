'use client'

import type { PackageVersionFiltersType, PackageVersionResultType, PackageVersionSortType } from '@panfactum/primary-api'
import React, { memo, useMemo } from 'react'

import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import { useGetListPackageVersion } from '@/lib/hooks/queries/crud/packageVersions'

/************************************************
 * Page
 * **********************************************/

const columns: CustomColDef<PackageVersionResultType, PackageVersionFiltersType>[] = [
  {
    field: 'id',
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
    field: 'isDeleted',
    headerName: 'Is Deleted',
    type: 'boolean',
    hidden: true,
    filter: 'boolean'
  },
  {
    field: 'isArchived',
    headerName: 'Is Archived',
    type: 'boolean',
    hidden: true,
    filter: 'boolean'
  },
  {
    field: 'versionTag',
    headerName: 'Tag',
    type: 'string',
    filter: 'name'
  },
  {
    field: 'createdAt',
    headerName: 'Created',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'createdBy',
    headerName: 'By',
    type: 'computed',
    render: ({ createdByFirstName, createdByLastName }) => {
      return (
        <div>
          {createdByFirstName}
          {' '}
          {createdByLastName}
        </div>
      )
    }
  },
  {
    field: 'sizeBytes',
    headerName: 'Size',
    type: 'bytes',
    filter: 'number'
  },
  {
    field: 'downloadCount',
    headerName: 'Downloads',
    type: 'number',
    filter: 'number'
  },
  {
    field: 'archivedAt',
    headerName: 'Archived',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'deletedAt',
    headerName: 'Deleted',
    type: 'dateTime',
    filter: 'date'
  }
]

interface PageProps {
  params: {packageId: string}
}

export default memo(function Page ({ params: { packageId } }: PageProps) {
  const permanentFilters = useMemo(() => ([
    { field: 'packageId' as const, operator: 'strEq' as const, value: packageId }
  ]), [packageId])

  return (
    <DataGrid<PackageVersionResultType, PackageVersionSortType, PackageVersionFiltersType>
      empty={<div>No versions found</div>}
      useGetList={useGetListPackageVersion}
      permanentFilters={permanentFilters}
      columns={columns}
    />
  )
})
