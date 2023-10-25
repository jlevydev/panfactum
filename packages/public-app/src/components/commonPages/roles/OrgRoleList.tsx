'use client'

import type { OrganizationRolesResultType, OrganizationRolesFiltersType, OrganizationRoleSortType } from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback, useMemo, useState } from 'react'

import type { BulkActionComponent } from '@/components/datagrid/ActionToolbar'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import DeleteRoleModal from '@/components/modals/DeleteRoleModal'
import { useHasPermissions } from '@/lib/hooks/queries/auth/useHasPermissions'
import { useHasPanfactumRole } from '@/lib/hooks/queries/auth/usePanfactumRole'
import { useGetListOrganizationRole } from '@/lib/hooks/queries/crud/organizationRoles'

/************************************************
 * List Actions
 * **********************************************/

const BulkActions: BulkActionComponent<OrganizationRolesResultType> = memo(({ data, selectedIds, onUnselectItems }) => {
  const [deleteRoleModalIsOpen, setDeleteRoleModalIsOpen] = useState<boolean>(false)

  const selectedRoles = data
    .filter(record => selectedIds.includes(record.id))
  const customRoles = selectedRoles.filter(record => record.organizationId !== null)

  const handleToggleDeleteModal = useCallback(() => {
    setDeleteRoleModalIsOpen(prev => !prev)
  }, [setDeleteRoleModalIsOpen])

  return (
    <>
      <BulkActionButton
        actionType="danger"
        onClick={handleToggleDeleteModal}
        disabled={customRoles.length === 0}
        tooltipText={customRoles.length === 0 ? 'You must select at least one custom role. Global roles cannot be deleted.' : 'Delete the selected roles.'}
      >
        Delete
      </BulkActionButton>
      <DeleteRoleModal
        open={deleteRoleModalIsOpen}
        onClose={handleToggleDeleteModal}
        onSuccess={onUnselectItems}
        roles={customRoles}
      />
    </>
  )
})

/************************************************
 * Main Page
 * **********************************************/

const columns: CustomColDef<OrganizationRolesResultType, OrganizationRolesFiltersType>[] = [
  {
    field: 'id',
    headerName: 'Role ID',
    type: 'string',
    hidden: true,
    filter: 'string'
  },
  {
    field: 'name',
    headerName: 'Name',
    type: 'string',
    filter: 'string'
  },
  {
    field: 'description',
    headerName: 'Description',
    type: 'string'
  },
  {
    field: 'isCustom',
    headerName: 'Custom',
    type: 'boolean',
    filter: 'boolean'
  },
  {
    field: 'activeAssigneeCount',
    headerName: 'Active Users',
    type: 'number',
    filter: 'number'
  }
]

interface IOrgRoleListProps {
  orgId: string;
  isAdminView: boolean;
}
export default function OrgRoleList (props: IOrgRoleListProps) {
  const { orgId, isAdminView } = props
  const isAdmin = useHasPanfactumRole(['admin'])
  const canWriteMembership = useHasPermissions({ hasAllOf: ['write:membership'] })
  const canEdit = isAdmin || canWriteMembership

  const router = useRouter()
  const handleRowClick = useCallback((record: OrganizationRolesResultType) => {
    if (isAdminView) {
      router.push(`/a/admin/orgs/${orgId}/members/roles/${record.id}`)
    } else {
      router.push(`/a/o/${orgId}/roles/${record.id}`)
    }
  }, [router, isAdminView, orgId])

  const permanentFilters = useMemo(() => ([
    { field: 'organizationId' as const, operator: 'strEq' as const, value: orgId }
  ]), [orgId])

  return (
    <DataGrid<OrganizationRolesResultType, OrganizationRoleSortType, OrganizationRolesFiltersType>
      onRowClick={handleRowClick}
      empty={<div>No roles found</div>}
      useGetList={useGetListOrganizationRole}
      columns={columns}
      permanentFilters={permanentFilters}
      BulkActions={canEdit ? BulkActions : undefined}
    />
  )
}
