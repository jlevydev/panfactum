import {
  BooleanInput, Datagrid, FilterButton, FilterForm,
  FunctionField, InfiniteList,
  TextField
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'

const Filters = [
  <BooleanInput
    label="Is Active"
    source="isActive"
    key="isActive"
    defaultValue={true}
  />
]

function UserListActions () {
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

interface IAllUserOrgsProps {
  userId: string;
}
export default function AllUserOrgs (props: IAllUserOrgsProps) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allOrgMemberships"
        filter={{ userId: props.userId, isUnitary: false }}
        sort={{ field: 'organizationId', order: 'DESC' }}
        actions={<UserListActions/>}
        empty={<div>No associated organizations</div>}
        perPage={25}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(id) => `${id}/basic`}
        >
          <TextField
            source="organizationName"
            label="Name"
          />
          <TextField
            source="roleName"
            label="Role"
          />
          <FunctionField
            source="createdAt"
            label="Joined At"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="deletedAt"
            label="Left At"
            render={(record: {id: string, deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
