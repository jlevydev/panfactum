import type { PackageResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import { useListContext } from 'react-admin'
import { useNavigate } from 'react-router-dom'

import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import ChangePackagesStatusModal from '@/components/modals/ChangePackagesStatusModal'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

/************************************************
 * List Actions
 * **********************************************/

function BulkActions () {
  const { selectedIds, data, onSelect } = useListContext<PackageResultType>()
  const [restorePackagesModalIsOpen, setRestorePackagesModalIsOpen] = useState<boolean>(false)
  const [archivePackagesModalIsOpen, setArchivePackagesModalIsOpen] = useState<boolean>(false)

  const selectedPackages = data
    .filter(record => selectedIds.includes(record.id))
  const notDeletedPackages = selectedPackages.filter(record => !record.isDeleted)
  const activePackages = notDeletedPackages.filter(record => !record.isArchived)
  const archivedPackages = notDeletedPackages.filter(record => record.isArchived)

  return (
    <>
      <BulkActionButton
        actionType="danger"
        onClick={() => setRestorePackagesModalIsOpen(true)}
        disabled={archivedPackages.length === 0}
        tooltipText={archivedPackages.length === 0 ? 'You must select at least one archived package that has not been deleted.' : 'Restores the selected packages if they have been archived.'}
      >
        Restore
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={() => setArchivePackagesModalIsOpen(true)}
        disabled={activePackages.length === 0}
        tooltipText={activePackages.length === 0 ? 'You must select at least one active package.' : 'Archives the selected packages.'}

      >
        Archive
      </BulkActionButton>
      <ChangePackagesStatusModal
        open={restorePackagesModalIsOpen}
        onClose={() => setRestorePackagesModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        packages={archivedPackages}
        isRemoving={false}
      />
      <ChangePackagesStatusModal
        open={archivePackagesModalIsOpen}
        onClose={() => setArchivePackagesModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        packages={activePackages}
        isRemoving={true}
      />
    </>
  )
}

/************************************************
 * List
 * **********************************************/

interface IProps {
  orgId: string;
}
export default function AllOrgPackages (props: IProps) {
  const basePath = useAdminBasePath()
  const navigate = useNavigate()
  return (
    <DataGrid
      listProps={{
        resource: 'packages',
        filter: { organizationId: props.orgId },
        sort: { field: 'name', order: 'DESC' }
      }}
      dataGridProps={{
        BulkActions,
        onRowClick: (record) => {
          navigate(`${basePath}/allPackages/${record.id}`)
        },
        empty: <div>No packages found</div>,
        columns: [
          {
            field: 'id',
            headerName: 'Package ID',
            type: 'string',
            hidden: true
          },
          {
            field: 'name',
            headerName: 'Name',
            type: 'string'
          },
          {
            field: 'isPublished',
            headerName: 'Published',
            type: 'boolean'
          },
          {
            field: 'activeVersionCount',
            headerName: 'Versions',
            type: 'number'
          },
          {
            field: 'createdAt',
            headerName: 'Created',
            type: 'dateTime'
          },
          {
            field: 'lastPublishedAt',
            headerName: 'Last Published',
            type: 'dateTime'
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
