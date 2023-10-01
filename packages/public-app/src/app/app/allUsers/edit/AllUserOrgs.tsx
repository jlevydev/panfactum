import type { OrganizationMembershipsResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  Datagrid,
  FunctionField, InfiniteList,
  TextField, TopToolbar, useListContext
} from 'react-admin'

import BulkActionButton from '@/components/list/BulkActionButton'
import ChangeOrganizationMembershipsStatusModal
  from '@/components/modals/ChangeOrganizationMembershipsStatusModal'
import ChangeUserRolesModal from '@/components/modals/ChangeUserRolesModal'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

/************************************************
 * List Actions
 * **********************************************/

function Actions () {
  return (
    <TopToolbar/>
  )
}

function BulkActions () {
  const { selectedIds, data, onSelect } = useListContext<OrganizationMembershipsResultType>()
  const [kickUsersModalIsOpen, setKickUsersModalIsOpen] = useState<boolean>(false)
  const [rejoinUsersModalIsOpen, setRejoinUsersModalIsOpen] = useState<boolean>(false)
  const [changeRoleModalIsOpen, setChangeRoleModalIsOpen] = useState<boolean>(false)

  const selectedMemberships = data
    .filter(record => selectedIds.includes(record.id))
  const activeMemberships = selectedMemberships.filter(record => !record.isDeleted)
  const deactivatedMemberships = selectedMemberships.filter(record => record.isDeleted)

  return (
    <>
      <BulkActionButton
        onClick={() => setChangeRoleModalIsOpen(true)}
        disabled={activeMemberships.length !== 1}
        tooltipText={activeMemberships.length !== 1 ? 'You must select only ONE active membership.' : "Changes the user's role."}
      >
        Change Role
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={() => setKickUsersModalIsOpen(true)}
        disabled={activeMemberships.length === 0}
        tooltipText={activeMemberships.length === 0 ? 'You must select at least one active membership.' : 'Removes the user from the selected organizations.'}
      >
        Remove
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={() => setRejoinUsersModalIsOpen(true)}
        disabled={deactivatedMemberships.length === 0}
        tooltipText={deactivatedMemberships.length === 0 ? 'You must select at least one deactivated membership.' : 'Reactivates the user in the selected organizations.'}
      >
        Rejoin
      </BulkActionButton>
      <ChangeUserRolesModal
        perspective="user"
        orgId={activeMemberships[0]?.organizationId ?? ''}
        open={changeRoleModalIsOpen}
        onClose={() => setChangeRoleModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="user"
        isRemoving={true}
        open={kickUsersModalIsOpen}
        onClose={() => setKickUsersModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="user"
        isRemoving={false}
        open={rejoinUsersModalIsOpen}
        onClose={() => setRejoinUsersModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        memberships={deactivatedMemberships}
      />
    </>
  )
}
/*******************************************
 * Main List
 * *****************************************/

interface IAllUserOrgsProps {
  userId: string;
}
export default function AllUserOrgs (props: IAllUserOrgsProps) {
  const basePath = useAdminBasePath()

  return (
    <div className="p-4">
      <InfiniteList
        resource="organizationMemberships"
        filter={{ userId: props.userId, isUnitary: false }}
        sort={{ field: 'organizationId', order: 'DESC' }}
        actions={<Actions/>}
        empty={<div>No associated organizations</div>}
        perPage={25}
        component={'div'}
      >
        <Datagrid
          bulkActionButtons={<BulkActions/>}
          rowClick={(_, __, record) => {
            return `${basePath}/allOrgs/${(record as OrganizationMembershipsResultType).organizationId}`
          }}
        >
          <TextField
            source="organizationName"
            label="Name"
          />
          <TextField
            source="roleName"
            label="Role"
          />
          <FunctionField
            source="createdAt"
            label="Joined At"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="deletedAt"
            label="Left At"
            render={(record: {id: string, deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
