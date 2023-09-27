import Button, { ButtonProps } from '@mui/material/Button'
import {
  DatagridConfigurable,
  TextField,
  EmailField,
  FunctionField,
  RaRecord,
  useLogin,
  SelectColumnsButton, TopToolbar, InfiniteList, useListContext
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import type { AllUserResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import ReactivateUsersModal from '@/components/modals/ReactivateUsersModal'

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

function BulkActionButton (props: ButtonProps) {
  return (
    <Button
      variant="contained"
      size="small"
      {...props}
      className={`py-1 px-2 text-xs normal-case bg-primary ${props.className ?? ''}`}
    />
  )
}

function BulkActions () {
  const { selectedIds, data, onSelect } = useListContext<AllUserResultType>()
  const [reactivateUsersModalIsOpen, setReactivateUsersModalIsOpen] = useState<boolean>(false)

  const selectedUsers = data
    .filter(record => selectedIds.includes(record.id))
  return (
    <>
      <BulkActionButton
        className="bg-red"
        onClick={() => setReactivateUsersModalIsOpen(true)}
      >
        Reactivate
      </BulkActionButton>
      <BulkActionButton className="bg-red">
        Deactivate
      </BulkActionButton>
      <ReactivateUsersModal
        open={reactivateUsersModalIsOpen}
        onClose={() => setReactivateUsersModalIsOpen(false)}
        onSuccess={() => onSelect([])}
        users={selectedUsers}
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
      resource="allUsers"
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
          render={(record: AllUserResultType) => (
            <div>
              {record.numberOfOrgs - 1}
            </div>
          )}
        />
        <FunctionField
          source="createdAt"
          label="Created"
          render={(record: AllUserResultType) => <TimeFromNowField unixSeconds={record.createdAt}/>}
        />
        <FunctionField
          source="deletedAt"
          label="Deactivated"
          render={(record: AllUserResultType) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
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
