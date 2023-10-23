'use client'

import type { OrganizationRolesResultType, OrganizationRolesFiltersType, OrganizationRoleSortType } from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'

import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import { useGetListOrganizationRole } from '@/lib/hooks/queries/crud/organizationRoles'

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
    />
  )
}
