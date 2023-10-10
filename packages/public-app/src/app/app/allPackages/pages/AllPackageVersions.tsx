import type { PackageVersionResultType, PackageVersionFiltersType } from '@panfactum/primary-api'
import React from 'react'

import DataGrid from '@/components/datagrid/DataGrid'

interface IProps {
  packageId: string;
}
export default function AllPackageVersions (props: IProps) {
  return (
    <DataGrid<PackageVersionResultType, PackageVersionFiltersType>
      listProps={{
        resource: 'packageVersions',
        filter: { packageId_strEq: props.packageId },
        sort: { field: 'createdAt', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No versions found</div>,
        columns: [
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
      }}
    />
  )
}
