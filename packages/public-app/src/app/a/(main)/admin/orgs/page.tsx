'use client'

import type { OrganizationFiltersType, OrganizationResultType, OrganizationSortType } from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback, useState } from 'react'

import type { BulkActionComponent } from '@/components/datagrid/ActionToolbar'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import MainListLayout from '@/components/layout/secondary/MainListLayout'
import ChangeOrgsStatusModal from '@/components/modals/ChangeOrgsStatusModal'
import { useGetListOrganization } from '@/lib/hooks/queries/crud/organizations'

/************************************************
 * List Actions
 * **********************************************/

const BulkActions: BulkActionComponent<OrganizationResultType> = memo(({ data, selectedIds, onUnselectItems }) => {
  const [reactivateModalIsOpen, setReactivateModalIsOpen] = useState<boolean>(false)
  const [deactivateModalIsOpen, setDeactivateModalIsOpen] = useState<boolean>(false)

  const toggleReactivateModal = useCallback(() => {
    setReactivateModalIsOpen(open => !open)
  }, [setReactivateModalIsOpen])
  const toggleDeactivateModal = useCallback(() => {
    setDeactivateModalIsOpen(open => !open)
  }, [setDeactivateModalIsOpen])

  const selectedOrgs = data
    .filter(record => selectedIds.includes(record.id))
  const selectedNonUnitaryOrgs = selectedOrgs.filter(org => !org.isUnitary)
  const activeOrgs = selectedNonUnitaryOrgs.filter(record => !record.isDeleted)
  const deactivatedOrgs = selectedNonUnitaryOrgs.filter(record => record.isDeleted)

  return (
    <>
      <BulkActionButton
        actionType="danger"
        onClick={toggleReactivateModal}
        disabled={deactivatedOrgs.length === 0}
        tooltipText={deactivatedOrgs.length === 0 ? 'You must select at least one deactivated, non-personal organization.' : 'Reactivates the selected organizations.'}
      >
        Reactivate
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={toggleDeactivateModal}
        disabled={activeOrgs.length === 0}
        tooltipText={activeOrgs.length === 0 ? 'You must select at least one active, non-personal organization.' : 'Deactivates the selected organizations.'}

      >
        Deactivate
      </BulkActionButton>
      <ChangeOrgsStatusModal
        open={reactivateModalIsOpen}
        onClose={toggleReactivateModal}
        onSuccess={onUnselectItems}
        organizations={deactivatedOrgs}
        isRemoving={false}
      />
      <ChangeOrgsStatusModal
        open={deactivateModalIsOpen}
        onClose={toggleDeactivateModal}
        onSuccess={onUnselectItems}
        organizations={activeOrgs}
        isRemoving={true}
      />
    </>
  )
})

/************************************************
 * Page
 * **********************************************/

const columns: CustomColDef<OrganizationResultType, OrganizationFiltersType>[] = [
  {
    field: 'id',
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
    field: 'isUnitary',
    headerName: 'Personal',
    type: 'boolean',
    filter: 'boolean'
  },
  {
    field: 'activeMemberCount',
    headerName: 'Members',
    type: 'number',
    filter: 'number'
  },
  {
    field: 'activePackageCount',
    headerName: 'Packages',
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
    field: 'updatedAt',
    headerName: 'Updated',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'deletedAt',
    headerName: 'Deactivated',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'isDeleted',
    headerName: 'Is Deactivated',
    type: 'boolean',
    filter: 'boolean',
    hidden: true
  }
]

export default memo(function Page () {
  const router = useRouter()
  const handleRowClick = useCallback((record: OrganizationResultType) => {
    router.push(`/a/admin/orgs/${record.id}`)
  }, [router])

  return (
    <MainListLayout title="All Organizations">
      <DataGrid<OrganizationResultType, OrganizationSortType, OrganizationFiltersType>
        BulkActions={BulkActions}
        onRowClick={handleRowClick}
        empty={<div>No organizations found</div>}
        useGetList={useGetListOrganization}
        columns={columns}
      />
    </MainListLayout>
  )
})
