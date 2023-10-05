import type { GridRenderCellParams } from '@mui/x-data-grid-pro'
import type { PackageVersionResultType } from '@panfactum/primary-api'
import React from 'react'

import DataGrid from '@/components/datagrid/DataGrid'

interface IProps {
  packageId: string;
}
export default function AllPackageVersions (props: IProps) {
  return (
    <DataGrid<PackageVersionResultType>
      listProps={{
        resource: 'packageVersions',
        filter: { packageId: props.packageId },
        sort: { field: 'createdAt', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No versions found</div>,
        columns: [
          {
            field: 'id',
            headerName: 'Version ID',
            type: 'string',
            hidden: true
          },
          {
            field: 'versionTag',
            headerName: 'Tag',
            type: 'string'
          },
          {
            field: 'createdAt',
            headerName: 'Created',
            type: 'dateTime'
          },
          {
            field: 'createdBy',
            headerName: 'By',
            type: 'computed',
            renderCell: (params: GridRenderCellParams<PackageVersionResultType, string>) => {
              const { row: { createdByFirstName, createdByLastName } } = params
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
            type: 'bytes'
          },
          {
            field: 'downloadCount',
            headerName: 'Downloads',
            type: 'number'
          },
          {
            field: 'archivedAt',
            headerName: 'Archived',
            type: 'dateTime'
          },
          {
            field: 'deletedAt',
            headerName: 'Deleted',
            type: 'dateTime'
          }
        ]
      }}
    />
  )
}
