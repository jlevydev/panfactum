'use client'

import type { UserResultType, UserFiltersType, UserSortType } from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback, useState } from 'react'

import type { BulkActionComponent } from '@/components/datagrid/ActionToolbar'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import DataGrid from '@/components/datagrid/DataGrid'
import type { CustomColDef } from '@/components/datagrid/types'
import MainListLayout from '@/components/layout/app/secondary/MainListLayout'
import ChangeUsersStatusModal from '@/components/modals/ChangeUsersStatusModal'
import { useGetListUser } from '@/lib/hooks/queries/crud/users'

/************************************************
 * List Actions
 * **********************************************/

const BulkActions: BulkActionComponent<UserResultType> = memo(({ data, selectedIds, onUnselectItems }) => {
  const [reactivateUsersModalIsOpen, setReactivateUsersModalIsOpen] = useState<boolean>(false)
  const [deactivateUsersModalIsOpen, setDeactivateUsersModalIsOpen] = useState<boolean>(false)

  const selectedUsers = data
    .filter(record => selectedIds.includes(record.id))
  const activeUsers = selectedUsers.filter(record => !record.isDeleted)
  const deactivatedUsers = selectedUsers.filter(record => record.isDeleted)

  const handleClickReactivate = useCallback(() => {
    setReactivateUsersModalIsOpen(true)
  }, [setReactivateUsersModalIsOpen])
  const handleClickDeactivate = useCallback(() => {
    setDeactivateUsersModalIsOpen(true)
  }, [setDeactivateUsersModalIsOpen])
  const handleCloseReactivate = useCallback(() => {
    setReactivateUsersModalIsOpen(false)
  }, [setReactivateUsersModalIsOpen])
  const handleCloseDeactivate = useCallback(() => {
    setDeactivateUsersModalIsOpen(false)
  }, [setDeactivateUsersModalIsOpen])

  return (
    <>
      <BulkActionButton
        actionType="danger"
        onClick={handleClickReactivate}
        disabled={deactivatedUsers.length === 0}
        tooltipText={deactivatedUsers.length === 0 ? 'You must select at least one deactivated user.' : 'Reactivates the selected users.'}
      >
        Reactivate
      </BulkActionButton>
      <BulkActionButton
        actionType="danger"
        onClick={handleClickDeactivate}
        disabled={activeUsers.length === 0}
        tooltipText={activeUsers.length === 0 ? 'You must select at least one active user.' : 'Deactivates the selected users.'}

      >
        Deactivate
      </BulkActionButton>
      <ChangeUsersStatusModal
        open={reactivateUsersModalIsOpen}
        onClose={handleCloseReactivate}
        onSuccess={onUnselectItems}
        users={deactivatedUsers}
        isRemoving={false}
      />
      <ChangeUsersStatusModal
        open={deactivateUsersModalIsOpen}
        onClose={handleCloseDeactivate}
        onSuccess={onUnselectItems}
        users={activeUsers}
        isRemoving={true}
      />
    </>
  )
})

/************************************************
 * Page
 * **********************************************/

const columns: CustomColDef<UserResultType, UserFiltersType>[] = [
  {
    field: 'id',
    headerName: 'User ID',
    type: 'string',
    hidden: true,
    filter: 'string'
  },
  {
    field: 'firstName',
    headerName: 'First Name',
    type: 'string',
    filter: 'name'
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    type: 'string',
    filter: 'name'
  },
  {
    field: 'email',
    headerName: 'Email',
    type: 'string',
    filter: 'name'
  },
  {
    field: 'numberOfOrgs',
    headerName: 'Organizations',
    type: 'number',
    filter: 'number'
  },
  {
    field: 'createdAt',
    headerName: 'Created',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'deletedAt',
    headerName: 'Deactivated',
    type: 'dateTime',
    filter: 'date'
  },
  {
    field: 'isDeleted',
    headerName: 'Is Deactivated',
    type: 'boolean',
    hidden: true,
    filter: 'boolean'
  }
]

export default memo(function Page () {
  const router = useRouter()
  const handleRowClick = useCallback((record: UserResultType) => {
    router.push(`/a/admin/users/${record.id}`)
  }, [router])

  return (
    <MainListLayout title="All Users">
      <DataGrid<UserResultType, UserSortType, UserFiltersType>
        BulkActions={BulkActions}
        onRowClick={handleRowClick}
        empty={<div>No users found</div>}
        useGetList={useGetListUser}
        columns={columns}
      />
    </MainListLayout>
  )
})
