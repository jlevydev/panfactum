'use client'

import type {
  PackageFiltersType,
  PackageResultType, PackageSortType
} from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback, useMemo, useState } from 'react'

import type { BulkActionComponent } from '@/components/datagrid/ActionToolbar'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import ChangePackagesStatusModal from '@/components/modals/ChangePackagesStatusModal'
import { useGetListPackage } from '@/lib/hooks/queries/crud/packages'

/************************************************
 * List Actions
 * **********************************************/

const BulkActions: BulkActionComponent<PackageResultType> = memo(({ data, selectedIds, onUnselectItems }) => {
  const [restorePackagesModalIsOpen, setRestorePackagesModalIsOpen] = useState<boolean>(false)
  const [archivePackagesModalIsOpen, setArchivePackagesModalIsOpen] = useState<boolean>(false)

  const toggleRestoreModal = useCallback(() => {
    setRestorePackagesModalIsOpen(prev => !prev)
  }, [setRestorePackagesModalIsOpen])

  const toggleArchiveModal = useCallback(() => {
    setArchivePackagesModalIsOpen(prev => !prev)
  }, [setArchivePackagesModalIsOpen])

  const selectedPackages = data
    .filter(record => selectedIds.includes(record.id))
  const notDeletedPackages = selectedPackages.filter(record => !record.isDeleted)
  const activePackages = notDeletedPackages.filter(record => !record.isArchived)
  const archivedPackages = notDeletedPackages.filter(record => record.isArchived)

  return (
    <>
      <BulkActionButton
        actionType="danger"
        onClick={toggleRestoreModal}
        disabled={archivedPackages.length === 0}
        tooltipText={archivedPackages.length === 0 ? 'You must select at least one archived package that has not been deleted.' : 'Restores the selected packages if they have been archived.'}
      >
        Restore
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={toggleArchiveModal}
        disabled={activePackages.length === 0}
        tooltipText={activePackages.length === 0 ? 'You must select at least one active package.' : 'Archives the selected packages.'}

      >
        Archive
      </BulkActionButton>
      <ChangePackagesStatusModal
        open={restorePackagesModalIsOpen}
        onClose={toggleRestoreModal}
        onSuccess={onUnselectItems}
        packages={archivedPackages}
        isRemoving={false}
      />
      <ChangePackagesStatusModal
        open={archivePackagesModalIsOpen}
        onClose={toggleArchiveModal}
        onSuccess={onUnselectItems}
        packages={activePackages}
        isRemoving={true}
      />
    </>
  )
})

/************************************************
 * Page
 * **********************************************/

const columns: CustomColDef<PackageResultType, PackageFiltersType>[] = [
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
    field: 'name',
    headerName: 'Name',
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

interface PageProps {
  params: {orgId: string}
}

export default memo(function Page ({ params: { orgId } }: PageProps) {
  const router = useRouter()
  const handleRowClick = useCallback((record: PackageResultType) => {
    router.push(`/a/admin/packages/${record.id}`)
  }, [router])

  const permanentFilters = useMemo(() => ([
    { field: 'organizationId' as const, operator: 'strEq' as const, value: orgId }
  ]), [orgId])

  return (
    <DataGrid<PackageResultType, PackageSortType, PackageFiltersType>
      BulkActions={BulkActions}
      onRowClick={handleRowClick}
      empty={<div>No packages found</div>}
      useGetList={useGetListPackage}
      permanentFilters={permanentFilters}
      columns={columns}
    />
  )
})
