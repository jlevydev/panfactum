import Button from '@mui/material/Button'
import type { UserResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import type { RaRecord } from 'react-admin'
import {
  DatagridConfigurable,
  TextField,
  EmailField,
  FunctionField,
  useLogin,
  SelectColumnsButton, TopToolbar, InfiniteList, useListContext
} from 'react-admin'

import BulkActionButton from '@/components/list/BulkActionButton'
import ChangeUsersStatusModal from '@/components/modals/ChangeUsersStatusModal'
import TimeFromNowField from '@/components/time/TimeFromNowField'

/************************************************
 * List Actions
 * **********************************************/

function Actions () {
  return (
    <TopToolbar>
      <SelectColumnsButton/>
    </TopToolbar>
  )
}

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
  const login = useLogin()
  const onMasqueradeClick = (targetUserId: string) => {
    void login({ loginMethod: 'masquerade', targetUserId }, '/')
      .catch(console.error)
  }
  return (
    <InfiniteList
      resource="users"
      actions={<Actions/>}
      perPage={25}
    >
      <DatagridConfigurable
        rowClick={(id) => `${id}/basic`}
        bulkActionButtons={<BulkActions/>}
        omit={['id']}
      >
        <TextField
          source="id"
          label="id"
        />
        <TextField
          source="firstName"
          label="First Name"
        />
        <TextField
          source="lastName"
          label="Last Name"
        />
        <EmailField
          source="email"
          label="Email"
        />
        <FunctionField
          source="numberOfOrgs"
          label="Organizations"
          // We don't want to count the unitary org in the display
          render={(record: UserResultType) => (
            <div>
              {record.numberOfOrgs - 1}
            </div>
          )}
        />
        <FunctionField
          source="createdAt"
          label="Created"
          render={(record: UserResultType) => <TimeFromNowField unixSeconds={record.createdAt}/>}
        />
        <FunctionField
          source="deletedAt"
          label="Deactivated"
          render={(record: UserResultType) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
        />
        <FunctionField
          label="Masquerade"
          render={(record: RaRecord<string>) => (
            <Button
              className="bg-primary"
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onMasqueradeClick(record.id)
              }}
            >
              Masquerade
            </Button>
          )}
        />
      </DatagridConfigurable>
    </InfiniteList>
  )
}
