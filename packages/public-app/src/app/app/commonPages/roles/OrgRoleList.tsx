import type { OrganizationRolesResultType, OrganizationRolesFiltersType } from '@panfactum/primary-api'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import DataGrid from '@/components/datagrid/DataGrid'

interface IOrgRoleListProps {
  orgId: string;
  isAdminView: boolean;
}
export default function OrgRoleList (props: IOrgRoleListProps) {
  const { orgId } = props

  const navigate = useNavigate()
  const onRowClick = useCallback((record: OrganizationRolesResultType) => {
    navigate(`${record.id}`)
  }, [navigate])

  return (
    <DataGrid<OrganizationRolesResultType, OrganizationRolesFiltersType>
      listProps={{
        resource: 'organizationRoles',
        filter: { organizationId_strEq: orgId },
        sort: { field: 'isCustom', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No roles</div>,
        onRowClick,
        columns: [
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
      }}
    />
  )
}
