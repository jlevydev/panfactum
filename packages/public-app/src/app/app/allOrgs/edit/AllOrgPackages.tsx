import type { PackageResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  BooleanField,
  BooleanInput, Datagrid, FilterButton, FilterForm, FunctionField,
  InfiniteList, NumberField,
  TextField, useListContext
} from 'react-admin'

import BulkActionButton from '@/components/list/BulkActionButton'
import ChangePackagesStatusModal from '@/components/modals/ChangePackagesStatusModal'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

/************************************************
 * List Actions
 * **********************************************/
const Filters = [
  <BooleanInput
    label="Is Archived"
    source="isArchived"
    key="isArchived"
    defaultValue={false}
  />,
  <BooleanInput
    label="Is Deleted"
    source="isDeleted"
    key="isDeleted"
    defaultValue={false}
  />
]

function Actions () {
  return (
    <div className="flex justify-between w-full">
      <FilterForm filters={Filters} />
      <div className="flex">
        <FilterButton
          filters={Filters}
          className="flex-grow"
        />
      </div>
    </div>
  )
}

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
  return (
    <div className="p-4">
      <InfiniteList
        resource="packages"
        filter={{ organizationId: props.orgId }}
        sort={{ field: 'name', order: 'DESC' }}
        actions={<Actions/>}
        empty={<div>No packages in this organization</div>}
        component={'div'}
        perPage={25}
      >
        <Datagrid
          bulkActionButtons={<BulkActions/>}
          rowClick={(_, __, record) => {
            return `${basePath}/allPackages/${(record as PackageResultType).id}`
          }}
        >
          <TextField
            source="name"
            label="Name"
          />
          <BooleanField
            source="isPublished"
            label="Published"
          />
          <NumberField
            source="activeVersionCount"
            label="Versions"
          />
          <FunctionField
            source="createdAt"
            label="Created"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="lastPublishedAt"
            label="Last Published"
            render={(record: {lastPublishedAt: number | null}) => <TimeFromNowField unixSeconds={record.lastPublishedAt}/>}
          />
          <FunctionField
            source="archivedAt"
            label="Archived"
            render={(record: {archivedAt: number}) => <TimeFromNowField unixSeconds={record.archivedAt}/>}
          />
          <FunctionField
            source="deletedAt"
            label="Deleted"
            render={(record: {deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
          />
        </Datagrid>
      </InfiniteList>
    </div>
  )
}
