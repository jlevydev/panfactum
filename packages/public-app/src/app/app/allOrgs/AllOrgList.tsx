import type { OrganizationResultType } from '@panfactum/primary-api'
import { useState } from 'react'
import {
  DatagridConfigurable,
  TextField,
  FunctionField,
  SelectColumnsButton, TopToolbar, NumberField, InfiniteList, BooleanField, useListContext
} from 'react-admin'

import BulkActionButton from '@/components/list/BulkActionButton'
import ChangeOrgsStatusModal from '@/components/modals/ChangeOrgsStatusModal'
import TimeFromNowField from '@/components/time/TimeFromNowField'

/************************************************
 * List Actions
 * **********************************************/

function Actions () {
  return (
    <TopToolbar>
      <SelectColumnsButton/>
    </TopToolbar>
  )
}

function BulkActions () {
  const { selectedIds, data, onSelect } = useListContext<OrganizationResultType>()
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
  return (
    <InfiniteList
      resource="organizations"
      actions={<Actions/>}
      perPage={25}
    >
      <DatagridConfigurable
        bulkActionButtons={<BulkActions/>}
        rowClick={(id) => `${id}/basic`}
        omit={['id', 'updatedAt']}
      >
        <TextField
          source="id"
          label="id"
        />
        <TextField
          source="name"
          label="Name"
        />
        <BooleanField
          source="isUnitary"
          label="Personal"
        />
        <NumberField
          source="activeMemberCount"
          label="Members"
        />
        <NumberField
          source="activePackageCount"
          label="Packages"
        />
        <FunctionField
          source="createdAt"
          label="Created"
          render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
        />
        <FunctionField
          source="updatedAt"
          label="Updated"
          render={(record: {updatedAt: number}) => <TimeFromNowField unixSeconds={record.updatedAt}/>}
        />
        <FunctionField
          source="deletedAt"
          label="Deactivated"
          render={(record: {deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
        />
      </DatagridConfigurable>
    </InfiniteList>
  )
}
