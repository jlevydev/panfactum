import {
  DatagridConfigurable,
  TextField,
  FunctionField,
  SelectColumnsButton, TopToolbar, NumberField, InfiniteList, BooleanField
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'

function Actions () {
  return (
    <TopToolbar>
      <SelectColumnsButton/>
    </TopToolbar>
  )
}

export default function AllPackageList () {
  return (
    <InfiniteList
      resource="allPackages"
      actions={<Actions/>}
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
          source="name"
          label="Name"
        />
        <TextField
          source="organizationName"
          label="Owned By"
        />
        <BooleanField
          source="isPublished"
          label="Published"
        />
        <NumberField
          source="activeVersionCount"
          label="Versions"
        />
        <FunctionField
          source="createdAt"
          label="Created"
          render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
        />
        <FunctionField
          source="lastPublishedAt"
          label="Last Published"
          render={(record: {lastPublishedAt: number | null}) => <TimeFromNowField unixSeconds={record.lastPublishedAt}/>}
        />
        <FunctionField
          source="archivedAt"
          label="Archived"
          render={(record: {archivedAt: number}) => <TimeFromNowField unixSeconds={record.archivedAt}/>}
        />
        <FunctionField
          source="deletedAt"
          label="Deleted"
          render={(record: {deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
        />
      </DatagridConfigurable>
    </InfiniteList>
  )
}
