import type { OrganizationRolesResultType, OrganizationRolesFiltersType } from '@panfactum/primary-api'
import React from 'react'

import DataGrid from '@/components/datagrid/DataGrid'

interface IAllOrgRoles {
  orgId: string;
}
export default function AllOrgRoles (props: IAllOrgRoles) {
  return (
    <DataGrid<OrganizationRolesResultType, OrganizationRolesFiltersType>
      listProps={{
        resource: 'organizationRoles',
        filter: { organizationId_strEq: props.orgId },
        sort: { field: 'isCustom', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No roles</div>,
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
