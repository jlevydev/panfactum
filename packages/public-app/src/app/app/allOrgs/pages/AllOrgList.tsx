import type { OrganizationResultType, OrganizationFiltersType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import { useListContext } from 'react-admin'
import { useNavigate } from 'react-router-dom'

import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import MainListLayout from '@/components/layout/MainListLayout'
import ChangeOrgsStatusModal from '@/components/modals/ChangeOrgsStatusModal'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

/************************************************
 * List Actions
 * **********************************************/

function BulkActions () {
  const { selectedIds, data = [], onSelect } = useListContext<OrganizationResultType>()
  const [reactivateModalIsOpen, setReactivateModalIsOpen] = useState<boolean>(false)
  const [deactivateModalIsOpen, setDeactivateModalIsOpen] = useState<boolean>(false)

  const selectedOrgs = data
    .filter(record => selectedIds.includes(record.id))
  const selectedNonUnitaryOrgs = selectedOrgs.filter(org => !org.isUnitary)
  const activeOrgs = selectedNonUnitaryOrgs.filter(record => !record.isDeleted)
  const deactivatedOrgs = selectedNonUnitaryOrgs.filter(record => record.isDeleted)

  return (
    <>
      <BulkActionButton
        actionType="danger"
        onClick={() => setReactivateModalIsOpen(true)}
        disabled={deactivatedOrgs.length === 0}
        tooltipText={deactivatedOrgs.length === 0 ? 'You must select at least one deactivated, non-personal organization.' : 'Reactivates the selected organizations.'}
      >
        Reactivate
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={() => setDeactivateModalIsOpen(true)}
        disabled={activeOrgs.length === 0}
        tooltipText={activeOrgs.length === 0 ? 'You must select at least one active, non-personal organization.' : 'Deactivates the selected organizations.'}

      >
        Deactivate
      </BulkActionButton>
      <ChangeOrgsStatusModal
        open={reactivateModalIsOpen}
        onClose={() => setReactivateModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        organizations={deactivatedOrgs}
        isRemoving={false}
      />
      <ChangeOrgsStatusModal
        open={deactivateModalIsOpen}
        onClose={() => setDeactivateModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        organizations={activeOrgs}
        isRemoving={true}
      />
    </>
  )
}

/************************************************
 * List
 * **********************************************/

export default function AllOrgList () {
  const basePath = useAdminBasePath()
  const navigate = useNavigate()
  return (
    <MainListLayout title="All Organizations">
      <DataGrid<OrganizationResultType, OrganizationFiltersType>
        listProps={{
          resource: 'organizations'
        }}
        dataGridProps={{
          BulkActions,
          onRowClick: (record) => {
            navigate(`${basePath}/allOrgs/${record.id}`)
          },
          empty: <div>No organizations found</div>,
          columns: [
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
        }}
      />
    </MainListLayout>
  )
}
