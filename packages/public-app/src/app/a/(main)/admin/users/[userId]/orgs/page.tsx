'use client'

import type {
  OrganizationMembershipsFiltersType,
  OrganizationMembershipSortType,
  OrganizationMembershipsResultType
} from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback, useMemo, useState } from 'react'

import type { BulkActionComponent } from '@/components/datagrid/ActionToolbar'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import ChangeOrganizationMembershipsStatusModal from '@/components/modals/ChangeOrganizationMembershipsStatusModal'
import ChangeUserRolesModal from '@/components/modals/ChangeUserRolesModal'
import GenericMemo from '@/components/util/GenericMemo'
import { useGetListOrganizationMembership } from '@/lib/hooks/queries/crud/organizationMemberships'

/************************************************
 * List Actions
 * **********************************************/

const BulkActions: BulkActionComponent<OrganizationMembershipsResultType> = GenericMemo(({ data, selectedIds, onUnselectItems }) => {
  const [kickUsersModalIsOpen, setKickUsersModalIsOpen] = useState<boolean>(false)
  const [rejoinUsersModalIsOpen, setRejoinUsersModalIsOpen] = useState<boolean>(false)
  const [changeRoleModalIsOpen, setChangeRoleModalIsOpen] = useState<boolean>(false)

  const toggleKickUsersModal = useCallback(() => {
    setKickUsersModalIsOpen(open => !open)
  }, [setKickUsersModalIsOpen])
  const toggleRejoinUsersModal = useCallback(() => {
    setRejoinUsersModalIsOpen(open => !open)
  }, [setRejoinUsersModalIsOpen])
  const toggleChangeRoleModal = useCallback(() => {
    setChangeRoleModalIsOpen(open => !open)
  }, [setChangeRoleModalIsOpen])

  const selectedMemberships = data
    .filter(record => selectedIds.includes(record.id))
  const activeMemberships = selectedMemberships.filter(record => !record.isDeleted)
  const deactivatedMemberships = selectedMemberships.filter(record => record.isDeleted)

  return (
    <>
      <BulkActionButton
        onClick={toggleChangeRoleModal}
        disabled={activeMemberships.length !== 1}
        tooltipText={activeMemberships.length !== 1 ? 'You must select only ONE active membership.' : "Changes the user's role."}
      >
        Change Role
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={toggleKickUsersModal}
        disabled={activeMemberships.length === 0}
        tooltipText={activeMemberships.length === 0 ? 'You must select at least one active membership.' : 'Removes the user from the selected organizations.'}
      >
        Remove
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={toggleRejoinUsersModal}
        disabled={deactivatedMemberships.length === 0}
        tooltipText={deactivatedMemberships.length === 0 ? 'You must select at least one deactivated membership.' : 'Reactivates the user in the selected organizations.'}
      >
        Rejoin
      </BulkActionButton>
      <ChangeUserRolesModal
        perspective="user"
        orgId={activeMemberships[0]?.organizationId ?? ''}
        open={changeRoleModalIsOpen}
        onClose={toggleChangeRoleModal}
        onSuccess={onUnselectItems}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="user"
        isRemoving={true}
        open={kickUsersModalIsOpen}
        onClose={toggleKickUsersModal}
        onSuccess={onUnselectItems}
        memberships={activeMemberships}
      />
      <ChangeOrganizationMembershipsStatusModal
        perspective="user"
        isRemoving={false}
        open={rejoinUsersModalIsOpen}
        onClose={toggleRejoinUsersModal}
        onSuccess={onUnselectItems}
        memberships={deactivatedMemberships}
      />
    </>
  )
})

/************************************************
 * Root
 * **********************************************/

const columns:CustomColDef<OrganizationMembershipsResultType, OrganizationMembershipsFiltersType>[] = [
  {
    field: 'id',
    headerName: 'Membership ID',
    type: 'string',
    filter: 'string',
    hidden: true
  },
  {
    field: 'organizationId',
    headerName: 'Organization ID',
    type: 'string',
    filter: 'string',
    hidden: true
  },
  {
    field: 'organizationName',
    headerName: 'Name',
    type: 'string',
    filter: 'name'
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
  },
  {
    field: 'isDeleted',
    headerName: 'Has Left',
    type: 'boolean',
    filter: 'boolean'
  }
]

interface PageProps {
  params: {userId: string;}
}
export default memo(function Page (props: PageProps) {
  const { params: { userId } } = props

  const router = useRouter()
  const handleRowClick = useCallback((record: OrganizationMembershipsResultType) => {
    router.push(`/a/admin/orgs/${record.organizationId}`)
  }, [router])

  const permanentFilters = useMemo(() => ([
    { field: 'userId' as const, operator: 'strEq' as const, value: userId }
  ]), [userId])

  return (
    <DataGrid<OrganizationMembershipsResultType, OrganizationMembershipSortType, OrganizationMembershipsFiltersType>
      BulkActions={BulkActions}
      onRowClick={handleRowClick}
      useGetList={useGetListOrganizationMembership}
      empty={<div>No associated sessions</div>}
      permanentFilters={permanentFilters}
      columns={columns}
    />
  )
})
