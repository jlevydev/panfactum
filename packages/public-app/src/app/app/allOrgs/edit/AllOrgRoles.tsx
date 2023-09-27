import {
  BooleanField,
  BooleanInput, Datagrid, FilterButton, FilterForm,
  InfiniteList, NumberField,
  TextField
} from 'react-admin'

const Filters = [
  <BooleanInput
    label="Is Custom"
    source="isCustom"
    key="isCustom"
    defaultValue={true}
  />
]

function OrgRoleActions () {
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

interface IAllOrgRoles {
  orgId: string;
}
export default function AllOrgRoles (props: IAllOrgRoles) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allOrgRoles"
        filter={{ organizationId: props.orgId }}
        sort={{ field: 'isCustom', order: 'DESC' }}
        actions={<OrgRoleActions/>}
        empty={<div>No members in this organization</div>}
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
            source="isCustom"
            label="Custom"
          />
          <NumberField
            source="activeAssigneeCount"
            label="Active Users"
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
