import type { UserResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  useListContext
} from 'react-admin'
import { useNavigate } from 'react-router-dom'

import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import MainListLayout from '@/components/layout/MainListLayout'
import ChangeUsersStatusModal from '@/components/modals/ChangeUsersStatusModal'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'

/************************************************
 * List Actions
 * **********************************************/

function BulkActions () {
  const { selectedIds, data, onSelect } = useListContext<UserResultType>()
  const [reactivateUsersModalIsOpen, setReactivateUsersModalIsOpen] = useState<boolean>(false)
  const [deactivateUsersModalIsOpen, setDeactivateUsersModalIsOpen] = useState<boolean>(false)

  const selectedUsers = data
    .filter(record => selectedIds.includes(record.id))
  const activeUsers = selectedUsers.filter(record => !record.isDeleted)
  const deactivatedUsers = selectedUsers.filter(record => record.isDeleted)

  return (
    <>
      <BulkActionButton
        actionType="danger"
        onClick={() => setReactivateUsersModalIsOpen(true)}
        disabled={deactivatedUsers.length === 0}
        tooltipText={deactivatedUsers.length === 0 ? 'You must select at least one deactivated user.' : 'Reactivates the selected users.'}
      >
        Reactivate
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={() => setDeactivateUsersModalIsOpen(true)}
        disabled={activeUsers.length === 0}
        tooltipText={activeUsers.length === 0 ? 'You must select at least one active user.' : 'Deactivates the selected users.'}

      >
        Deactivate
      </BulkActionButton>
      <ChangeUsersStatusModal
        open={reactivateUsersModalIsOpen}
        onClose={() => setReactivateUsersModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        users={deactivatedUsers}
        isRemoving={false}
      />
      <ChangeUsersStatusModal
        open={deactivateUsersModalIsOpen}
        onClose={() => setDeactivateUsersModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        users={activeUsers}
        isRemoving={true}
      />
    </>
  )
}

/************************************************
 * List
 * **********************************************/

export default function AllUserList () {
  const basePath = useAdminBasePath()
  const navigate = useNavigate()
  return (
    <MainListLayout title="All Users">
      <DataGrid
        listProps={{
          resource: 'users'
        }}
        dataGridProps={{
          BulkActions,
          onRowClick: (record) => {
            navigate(`${basePath}/allUsers/${record.id}`)
          },
          empty: <div>No users found</div>,
          columns: [
            {
              field: 'id',
              headerName: 'User ID',
              type: 'string',
              hidden: true
            },
            {
              field: 'firstName',
              headerName: 'First Name',
              type: 'string'
            },
            {
              field: 'lastName',
              headerName: 'Last Name',
              type: 'string'
            },
            {
              field: 'email',
              headerName: 'Email',
              type: 'string'
            },
            {
              field: 'numberOfOrgs',
              headerName: 'Organizations',
              type: 'number',
              valueGetter: (params) => params.value - 1
            },
            {
              field: 'createdAt',
              headerName: 'Created',
              type: 'dateTime'
            },
            {
              field: 'deletedAt',
              headerName: 'Deactivated',
              type: 'dateTime'
            }
          ]
        }}
      />
    </MainListLayout>
  )
}
