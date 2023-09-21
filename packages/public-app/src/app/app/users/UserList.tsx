import Button from '@mui/material/Button'
import type { UserType } from '@panfactum/primary-api'
import * as dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  List,
  DatagridConfigurable,
  TextField,
  EmailField,
  FunctionField,
  RaRecord,
  useLogin,
  SelectColumnsButton, TopToolbar, NumberField
} from 'react-admin'

dayjs.extend(relativeTime)

interface IUserListProps {
  resource: 'allUsers' | 'users'
}

function UserListActions () {
  return (
    <TopToolbar>
      <SelectColumnsButton/>
    </TopToolbar>
  )
}

export default function UserList (props: IUserListProps) {
  const { resource } = props
  const login = useLogin()
  const onMasqueradeClick = (targetUserId: string) => {
    void login({ loginMethod: 'masquerade', targetUserId }, '/')
      .catch(console.error)
  }
  return (
    <List
      resource={resource}
      actions={<UserListActions/>}
    >
      <DatagridConfigurable
        rowClick="edit"
        omit={['ID']}
      >
        <TextField
          source="id"
          label="ID"
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
          render={(record: UserType) => (
            <div>
              {dayjs.unix(record.createdAt).fromNow()}
            </div>
          )}
        />
        <FunctionField
          label="Masquerade"
          render={(record: RaRecord<string>) => (
            <Button
              className="bg-primary"
              variant="contained"
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
    </List>
  )
}
