import type { OrganizationMembershipsResultType, OrganizationMembershipsFiltersType } from '@panfactum/primary-api'
import React, { useCallback, useMemo, useState } from 'react'
import { useListContext } from 'react-admin'
import { useNavigate } from 'react-router-dom'

import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import ChangeOrganizationMembershipsStatusModal from '@/components/modals/ChangeOrganizationMembershipsStatusModal'
import ChangeUserRolesModal from '@/components/modals/ChangeUserRolesModal'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'
import { useHasPanfactumRole } from '@/lib/hooks/queries/useHasPanfactumRole'
import { useHasPermissions } from '@/lib/hooks/queries/useHasPermissions'

/************************************************
 * List Actions
 * **********************************************/

function BulkActions ({ orgId }: {orgId: string}) {
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
interface IOrgMemberListProps {
  orgId: string;
  isAdminView: boolean;
}

export default function OrgMemberList (props: IOrgMemberListProps) {
  const { orgId, isAdminView } = props

  const basePath = useAdminBasePath()
  const navigate = useNavigate()
  const hasAdmin = useHasPanfactumRole(['admin'])
  const check = useMemo(() => ({ hasOneOf: ['write:membership'] }), [])
  const hasWrite = useHasPermissions(check)
  const canUpdate = hasAdmin || hasWrite

  const Actions = useCallback(() => <BulkActions orgId={orgId}/>, [orgId])

  const onRowClick = useCallback((record: OrganizationMembershipsResultType) => {
    if (isAdminView) {
      navigate(`${basePath}/allUsers/${record.userId}`)
    }
  }, [basePath, isAdminView, navigate])

  return (
    <DataGrid<OrganizationMembershipsResultType, OrganizationMembershipsFiltersType>
      listProps={{
        resource: 'organizationMemberships',
        filter: { organizationId_strEq: orgId },
        sort: { field: 'userLastName', order: 'DESC' }
      }}
      dataGridProps={{
        BulkActions: canUpdate ? Actions : undefined,
        onRowClick,
        empty: <div>No users</div>,
        columns: [
          {
            field: 'id',
            headerName: 'Membership ID',
            type: 'string',
            hidden: true,
            filter: 'string'
          },
          {
            field: 'userId',
            headerName: 'User ID',
            type: 'string',
            hidden: true,
            filter: 'string'
          },
          {
            field: 'userFirstName',
            headerName: 'First name',
            type: 'string',
            filter: 'name'
          },
          {
            field: 'userLastName',
            headerName: 'Last name',
            type: 'string',
            filter: 'name'
          },
          {
            field: 'userEmail',
            headerName: 'Email',
            type: 'string',
            filter: 'name'
          },
          {
            field: 'roleId',
            headerName: 'Role ID',
            type: 'string',
            filter: 'string',
            hidden: true
          },
          {
            field: 'roleName',
            headerName: 'Role',
            type: 'string',
            filter: 'string'
          },
          {
            field: 'createdAt',
            headerName: 'Joined',
            type: 'dateTime',
            filter: 'date'
          },
          {
            field: 'deletedAt',
            headerName: 'Left',
            type: 'dateTime',
            filter: 'date'
          }
        ]
      }}
    />
  )
}
