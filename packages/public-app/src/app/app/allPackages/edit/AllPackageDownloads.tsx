import type { GridRenderCellParams } from '@mui/x-data-grid-pro'
import type { PackageDownloadResultType } from '@panfactum/primary-api'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import DataGrid from '@/components/datagrid/DataGrid'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

interface IProps {
  packageId: string;
}
export default function AllPackageDownloads (props: IProps) {
  const basePath = useAdminBasePath()
  const navigate = useNavigate()

  return (
    <DataGrid<PackageDownloadResultType>
      listProps={{
        resource: 'packageDownloads',
        filter: { packageId: props.packageId },
        sort: { field: 'createdAt', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No downloads for this package</div>,
        onRowClick: (record) => {
          navigate(`${basePath}/allUsers/${record.userId}`)
        },
        columns: [
          {
            field: 'id',
            headerName: 'Download ID',
            type: 'string',
            hidden: true
          },
          {
            field: 'createdAt',
            headerName: 'Created',
            type: 'dateTime'
          },
          {
            field: 'versionTag',
            headerName: 'Version',
            type: 'string'
          },
          {
            field: 'createdBy',
            headerName: 'By',
            type: 'computed',
            renderCell: (params: GridRenderCellParams<PackageDownloadResultType, string>) => {
              const { row: { userFirstName, userLastName } } = params
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
            type: 'ip'
          }
        ]
      }}
    />
  )
}
