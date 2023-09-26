import {
  DatagridConfigurable,
  TextField,
  FunctionField,
  SelectColumnsButton, TopToolbar, NumberField, InfiniteList, BooleanField
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'

function UserListActions () {
  return (
    <TopToolbar>
      <SelectColumnsButton/>
    </TopToolbar>
  )
}

export default function AllOrgList () {
  return (
    <InfiniteList
      resource="allOrgs"
      actions={<UserListActions/>}
      perPage={25}
    >
      <DatagridConfigurable
        rowClick={(id) => `${id}/basic`}
        omit={['id', 'updatedAt']}
      >
        <TextField
          source="id"
          label="id"
        />
        <TextField
          source="name"
          label="Name"
        />
        <BooleanField
          source="isUnitary"
          label="Personal"
        />
        <NumberField
          source="activeMemberCount"
          label="Members"
        />
        <NumberField
          source="activePackageCount"
          label="Packages"
        />
        <FunctionField
          source="createdAt"
          label="Created At"
          render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
        />
        <FunctionField
          source="updatedAt"
          label="Updated At"
          render={(record: {updatedAt: number}) => <TimeFromNowField unixSeconds={record.updatedAt}/>}
        />
        <FunctionField
          source="deletedAt"
          label="Deleted At"
          render={(record: {deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
        />
      </DatagridConfigurable>
    </InfiniteList>
  )
}
