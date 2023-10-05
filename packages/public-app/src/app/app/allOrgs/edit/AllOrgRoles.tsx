import type { OrganizationRolesResultType } from '@panfactum/primary-api'
import React from 'react'

import DataGrid from '@/components/datagrid/DataGrid'

interface IAllOrgRoles {
  orgId: string;
}
export default function AllOrgRoles (props: IAllOrgRoles) {
  return (
    <DataGrid<OrganizationRolesResultType>
      listProps={{
        resource: 'organizationRoles',
        filter: { organizationId: props.orgId },
        sort: { field: 'isCustom', order: 'DESC' }
      }}
      dataGridProps={{
        empty: <div>No roles</div>,
        columns: [
          {
            field: 'id',
            headerName: 'Role ID',
            type: 'string',
            hidden: true
          },
          {
            field: 'name',
            headerName: 'Name',
            type: 'string'
          },
          {
            field: 'isCustom',
            headerName: 'Custom',
            type: 'boolean'
          },
          {
            field: 'activeAssigneeCount',
            headerName: 'Active Users',
            type: 'number'
          }
        ]
      }}
    />
  )
}
