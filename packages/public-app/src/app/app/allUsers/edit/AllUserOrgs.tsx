import type { OrganizationMembershipsResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  useListContext
} from 'react-admin'
import { useNavigate } from 'react-router-dom'

import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import ChangeOrganizationMembershipsStatusModal
  from '@/components/modals/ChangeOrganizationMembershipsStatusModal'
import ChangeUserRolesModal from '@/components/modals/ChangeUserRolesModal'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

/************************************************
 * List Actions
 * **********************************************/

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
  const navigate = useNavigate()
  return (
    <DataGrid<OrganizationMembershipsResultType>
      listProps={{
        resource: 'organizationMemberships',
        filter: { userId: props.userId, isUnitary: false },
        sort: { field: 'organizationId', order: 'DESC' }
      }}
      dataGridProps={{
        BulkActions,
        onRowClick: (record) => {
          navigate(`${basePath}/allOrgs/${record.organizationId}`)
        },
        empty: <div>No associated sessions</div>,
        columns: [
          {
            field: 'organizationName',
            headerName: 'Name',
            type: 'string'
          },
          {
            field: 'roleName',
            headerName: 'Role',
            type: 'string'
          },
          {
            field: 'createdAt',
            headerName: 'Joined',
            type: 'dateTime'
          },
          {
            field: 'deletedAt',
            headerName: 'Left',
            type: 'dateTime'
          }
        ]
      }}
    />
  )
}
