import Button from '@mui/material/Button'
import {
  DatagridConfigurable,
  TextField,
  EmailField,
  FunctionField,
  RaRecord,
  useLogin,
  SelectColumnsButton, TopToolbar, NumberField, InfiniteList
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import type { AllUserResultType } from '@panfactum/primary-api'

function UserListActions () {
  return (
    <TopToolbar>
      <SelectColumnsButton/>
    </TopToolbar>
  )
}

export default function AllUserList () {
  const login = useLogin()
  const onMasqueradeClick = (targetUserId: string) => {
    void login({ loginMethod: 'masquerade', targetUserId }, '/')
      .catch(console.error)
  }
  return (
    <InfiniteList
      resource="allUsers"
      actions={<UserListActions/>}
      perPage={25}
    >
      <DatagridConfigurable
        rowClick={(id) => `${id}/basic`}
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
        <NumberField
          source="numberOfOrgs"
          label="Organizations"
        />
        <FunctionField
          source="createdAt"
          label="Created At"
          render={(record: AllUserResultType) => <TimeFromNowField unixSeconds={record.createdAt}/>}
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
