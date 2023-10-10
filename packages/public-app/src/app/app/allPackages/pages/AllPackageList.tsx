import type { PackageResultType, PackageFiltersType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import { useListContext } from 'react-admin'
import { useNavigate } from 'react-router-dom'

import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import MainListLayout from '@/components/layout/MainListLayout'
import ChangePackagesStatusModal from '@/components/modals/ChangePackagesStatusModal'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

/************************************************
 * List Actions
 * **********************************************/

function BulkActions () {
  const { selectedIds, data = [], onSelect } = useListContext<PackageResultType>()
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

export default function AllPackageList () {
  const basePath = useAdminBasePath()
  const navigate = useNavigate()
  return (
    <MainListLayout title="All Packages">
      <DataGrid<PackageResultType, PackageFiltersType>
        listProps={{
          resource: 'packages'
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
              hidden: true,
              filter: 'string'
            },
            {
              field: 'isArchived',
              headerName: 'Is Archived',
              type: 'boolean',
              hidden: true,
              filter: 'boolean'
            },
            {
              field: 'isDeleted',
              headerName: 'Is Deleted',
              type: 'boolean',
              hidden: true,
              filter: 'boolean'
            },
            {
              field: 'organizationId',
              headerName: 'Organization ID',
              type: 'string',
              hidden: true,
              filter: 'string'
            },
            {
              field: 'name',
              headerName: 'Name',
              type: 'string',
              filter: 'name'
            },
            {
              field: 'organizationName',
              headerName: 'Owned By',
              type: 'string',
              filter: 'name'
            },
            {
              field: 'isPublished',
              headerName: 'Is Published',
              type: 'boolean',
              filter: 'boolean'
            },
            {
              field: 'activeVersionCount',
              headerName: 'Active Versions',
              type: 'number',
              filter: 'number'
            },
            {
              field: 'createdAt',
              headerName: 'Created',
              type: 'dateTime',
              filter: 'date'
            },
            {
              field: 'lastPublishedAt',
              headerName: 'Last Published',
              type: 'dateTime',
              filter: 'date'
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
    </MainListLayout>
  )
}
