import type { OrganizationMembershipsResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  Datagrid, EmailField,
  FunctionField, InfiniteList,
  TextField, TopToolbar, useListContext
} from 'react-admin'

import BulkActionButton from '@/components/list/BulkActionButton'
import ChangeOrganizationMembershipsStatusModal from '@/components/modals/ChangeOrganizationMembershipsStatusModal'
import ChangeUserRolesModal from '@/components/modals/ChangeUserRolesModal'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

interface IAllOrgMemberListProps {
  orgId: string;
}

/************************************************
 * List Actions
 * **********************************************/

function Actions () {
  return (
    <TopToolbar/>
  )
}

function BulkActions ({ orgId }: IAllOrgMemberListProps) {
  const { selectedIds, data, onSelect } = useListContext<OrganizationMembershipsResultType>()
  const [deactivateMembershipModalIsOpen, setDeactivateMembershipModalIsOpen] = useState<boolean>(false)
  const [reactivateMembershipModalIsOpen, setReactivateMembershipModalIsOpen] = useState<boolean>(false)
  const [changeRoleModalIsOpen, setChangeRoleModalIsOpen] = useState<boolean>(false)

  const selectedMemberships = data
    .filter(record => selectedIds.includes(record.id))
  const activeMemberships = selectedMemberships.filter(record => !record.isDeleted)
  const deactivatedMemberships = selectedMemberships.filter(record => record.isDeleted)

  return (
    <>
      <BulkActionButton
        onClick={() => setChangeRoleModalIsOpen(true)}
        disabled={activeMemberships.length === 0}
        tooltipText={activeMemberships.length === 0 ? 'You must select at least one active membership.' : "Changes the users' role."}
      >
        Change Role
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={() => setDeactivateMembershipModalIsOpen(true)}
        disabled={activeMemberships.length === 0}
        tooltipText={activeMemberships.length === 0 ? 'You must select at least one active membership.' : 'Removes the user from the selected organizations.'}
      >
        Remove
      </BulkActionButton>

      <BulkActionButton
        actionType="danger"
        onClick={() => setReactivateMembershipModalIsOpen(true)}
        disabled={deactivatedMemberships.length === 0}
        tooltipText={deactivatedMemberships.length === 0 ? 'You must select at least one deactivated membership.' : 'Reactivates the user in the selected organizations.'}
      >
        Reactivate
      </BulkActionButton>
      <ChangeUserRolesModal
        perspective="organization"
        orgId={orgId}
        open={changeRoleModalIsOpen}
        onClose={() => setChangeRoleModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="organization"
        isRemoving={true}
        open={deactivateMembershipModalIsOpen}
        onClose={() => setDeactivateMembershipModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="organization"
        isRemoving={false}
        open={reactivateMembershipModalIsOpen}
        onClose={() => setReactivateMembershipModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        memberships={deactivatedMemberships}
      />
    </>
  )
}

/*******************************************
 * List
 * *****************************************/

export default function AllOrgMemberList (props: IAllOrgMemberListProps) {
  const basePath = useAdminBasePath()
  return (
    <div className="p-4">
      <InfiniteList
        resource="organizationMemberships"
        filter={{ organizationId: props.orgId }}
        sort={{ field: 'userLastName', order: 'DESC' }}
        actions={<Actions/>}
        empty={<div>No members in this organization</div>}
        component={'div'}
        perPage={25}
      >
        <Datagrid
          bulkActionButtons={<BulkActions orgId={props.orgId}/>}
          rowClick={(_, __, record) => {
            return `${basePath}/allUsers/${(record as OrganizationMembershipsResultType).userId}`
          }}
        >
          <TextField
            source="userFirstName"
            label="First Name"
          />
          <TextField
            source="userLastName"
            label="Last Name"
          />
          <EmailField
            source="userEmail"
            label="Email"
          />
          <TextField
            source="roleName"
            label="Role"
          />
          <FunctionField
            source="createdAt"
            label="Joined"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="deletedAt"
            label="Left"
            render={(record: {id: string, deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
