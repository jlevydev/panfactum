import type { PackageDownloadResultType, PackageDownloadFiltersType } from '@panfactum/primary-api'
import { useNavigate } from 'react-router-dom'

import DataGrid from '@/components/datagrid/DataGrid'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

interface IProps {
  userId: string;
}
export default function AllUserPackageDownloads (props: IProps) {
  const basePath = useAdminBasePath()
  const navigate = useNavigate()
  return (
    <DataGrid<PackageDownloadResultType, PackageDownloadFiltersType>
      listProps={{
        resource: 'packageDownloads',
        filter: { userId_strEq: props.userId },
        sort: { field: 'createdAt', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No associated downloads</div>,
        onRowClick: (record) => {
          navigate(`${basePath}/allPackages/${record.packageId}`)
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
      }}
    />
  )
}
