import type { PackageDownloadResultType, PackageDownloadFiltersType } from '@panfactum/primary-api'
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
    <DataGrid<PackageDownloadResultType, PackageDownloadFiltersType>
      listProps={{
        resource: 'packageDownloads',
        filter: { packageId_strEq: props.packageId },
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
      }}
    />
  )
}
