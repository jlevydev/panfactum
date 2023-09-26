import {
  BooleanField,
  BooleanInput, Datagrid, FilterButton, FilterForm, FunctionField,
  InfiniteList, NumberField,
  TextField
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'

const Filters = [
  <BooleanInput
    label="Is Archived"
    source="isArchived"
    key="isArchived"
    defaultValue={false}
  />,
  <BooleanInput
    label="Is Deleted"
    source="isDeleted"
    key="isDeleted"
    defaultValue={false}
  />
]

function Actions () {
  return (
    <div className="flex justify-between w-full">
      <FilterForm filters={Filters} />
      <div className="flex">
        <FilterButton
          filters={Filters}
          className="flex-grow"
        />
      </div>
    </div>
  )
}

interface IProps {
  orgId: string;
}
export default function AllOrgPackages (props: IProps) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allPackages"
        filter={{ organizationId: props.orgId }}
        sort={{ field: 'name', order: 'DESC' }}
        actions={<Actions/>}
        empty={<div>No packages in this organization</div>}
        component={'div'}
        perPage={25}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(id) => `${id}/basic`}
        >
          <TextField
            source="name"
            label="Name"
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
        </Datagrid>
      </InfiniteList>
    </div>
  )
}
