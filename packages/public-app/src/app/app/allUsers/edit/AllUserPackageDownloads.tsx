import type { PackageDownloadResultType } from '@panfactum/primary-api'
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
    <DataGrid<PackageDownloadResultType>
      listProps={{
        resource: 'packageDownloads',
        filter: { userId: props.userId },
        sort: { field: 'createdAt', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No associated downloads</div>,
        onRowClick: (record) => {
          navigate(`${basePath}/allPackages/${record.packageId}`)
        },
        columns: [
          {
            field: 'createdAt',
            headerName: 'Time',
            type: 'dateTime'
          },
          {
            field: 'packageName',
            headerName: 'Name',
            description: 'The package name',
            type: 'string'
          },
          {
            field: 'versionTag',
            headerName: 'Version',
            type: 'string'
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
