'use client'

import type {
  OrganizationMembershipsResultType, OrganizationMembershipsFiltersType,
  OrganizationMembershipSortType
} from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { createContext, memo, useCallback, useContext, useMemo, useState } from 'react'

import type { BulkActionComponent } from '@/components/datagrid/ActionToolbar'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import ChangeOrganizationMembershipsStatusModal from '@/components/modals/ChangeOrganizationMembershipsStatusModal'
import ChangeUserRolesModal from '@/components/modals/ChangeUserRolesModal'
import { useHasPermissions } from '@/lib/hooks/queries/auth/useHasPermissions'
import { useHasPanfactumRole } from '@/lib/hooks/queries/auth/usePanfactumRole'
import { useGetListOrganizationMembership } from '@/lib/hooks/queries/crud/organizationMemberships'

/************************************************
 * List Actions
 * **********************************************/

const BulkActionsContext = createContext<{orgId: string}>({ orgId: 'dummy' })

const BulkActions: BulkActionComponent<OrganizationMembershipsResultType> = memo(({ data, selectedIds, onUnselectItems }) => {
  const [deactivateMembershipModalIsOpen, setDeactivateMembershipModalIsOpen] = useState<boolean>(false)
  const [reactivateMembershipModalIsOpen, setReactivateMembershipModalIsOpen] = useState<boolean>(false)
  const [changeRoleModalIsOpen, setChangeRoleModalIsOpen] = useState<boolean>(false)
  const { orgId } = useContext(BulkActionsContext)
  const toggleDeactivateMembershipModal = useCallback(() => {
    setDeactivateMembershipModalIsOpen(prev => !prev)
  }, [setDeactivateMembershipModalIsOpen])
  const toggleReactivateMembershipModal = useCallback(() => {
    setReactivateMembershipModalIsOpen(prev => !prev)
  }, [setReactivateMembershipModalIsOpen])
  const toggleChangeRoleModal = useCallback(() => {
    setChangeRoleModalIsOpen(prev => !prev)
  }, [setChangeRoleModalIsOpen])

  const selectedMemberships = data
    .filter(record => selectedIds.includes(record.id))
  const activeMemberships = selectedMemberships.filter(record => !record.isDeleted)
  const deactivatedMemberships = selectedMemberships.filter(record => record.isDeleted)

  return (
    <>
      <BulkActionButton
        onClick={toggleChangeRoleModal}
        disabled={activeMemberships.length === 0}
        tooltipText={activeMemberships.length === 0 ? 'You must select at least one active membership.' : "Changes the users' role."}
      >
        Change Role
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={toggleDeactivateMembershipModal}
        disabled={activeMemberships.length === 0}
        tooltipText={activeMemberships.length === 0 ? 'You must select at least one active membership.' : 'Removes the user from the selected organizations.'}
      >
        Remove
      </BulkActionButton>

      <BulkActionButton
        actionType="danger"
        onClick={toggleReactivateMembershipModal}
        disabled={deactivatedMemberships.length === 0}
        tooltipText={deactivatedMemberships.length === 0 ? 'You must select at least one deactivated membership.' : 'Reactivates the user in the selected organizations.'}
      >
        Reactivate
      </BulkActionButton>
      <ChangeUserRolesModal
        perspective="organization"
        orgId={orgId}
        open={changeRoleModalIsOpen}
        onClose={toggleChangeRoleModal}
        onSuccess={onUnselectItems}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="organization"
        isRemoving={true}
        open={deactivateMembershipModalIsOpen}
        onClose={toggleDeactivateMembershipModal}
        onSuccess={onUnselectItems}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="organization"
        isRemoving={false}
        open={reactivateMembershipModalIsOpen}
        onClose={toggleReactivateMembershipModal}
        onSuccess={onUnselectItems}
        memberships={deactivatedMemberships}
      />
    </>
  )
})

/*******************************************
 * List
 * *****************************************/
const columns: CustomColDef<OrganizationMembershipsResultType, OrganizationMembershipsFiltersType>[] = [
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

interface IOrgMemberListProps {
  orgId: string;
  isAdminView: boolean;
}

export default function OrgMemberList (props: IOrgMemberListProps) {
  const { orgId, isAdminView } = props

  const router = useRouter()
  const hasAdmin = useHasPanfactumRole(['admin'])
  const check = useMemo(() => ({ hasOneOf: ['write:membership'] }), [])
  const hasWrite = useHasPermissions(check)
  const canUpdate = hasAdmin || hasWrite

  const handleRowClick = useCallback((record: OrganizationMembershipsResultType) => {
    if (isAdminView) {
      router.push(`/a/admin/users/${record.userId}`)
    }
  }, [router, isAdminView])

  const permanentFilters = useMemo(() => ([
    { field: 'organizationId' as const, operator: 'strEq' as const, value: orgId }
  ]), [orgId])

  const bulkActionsContextValue = useMemo(() => ({
    orgId
  }), [orgId])

  return (
    <BulkActionsContext.Provider value={bulkActionsContextValue}>
      <DataGrid<OrganizationMembershipsResultType, OrganizationMembershipSortType, OrganizationMembershipsFiltersType>
        BulkActions={canUpdate ? BulkActions : undefined}
        onRowClick={handleRowClick}
        empty={<div>No memberships found</div>}
        useGetList={useGetListOrganizationMembership}
        columns={columns}
        permanentFilters={permanentFilters}
      />
    </BulkActionsContext.Provider>
  )
}
