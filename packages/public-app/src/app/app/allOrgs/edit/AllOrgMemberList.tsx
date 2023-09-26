import {
  BooleanInput, Datagrid, EmailField, FilterButton, FilterForm,
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

function MemberListActions () {
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

interface IAllOrgMemberListProps {
  orgId: string;
}
export default function AllOrgMemberList (props: IAllOrgMemberListProps) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allOrgMemberships"
        filter={{ organizationId: props.orgId }}
        sort={{ field: 'userLastName', order: 'DESC' }}
        actions={<MemberListActions/>}
        empty={<div>No members in this organization</div>}
        component={'div'}
        perPage={25}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(id) => `${id}/basic`}
        >
          <TextField
            source="userFirstName"
            label="First Name"
          />
          <TextField
            source="userLastName"
            label="Last Name"
          />
          <EmailField
            source="userEmail"
            label="Email"
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
