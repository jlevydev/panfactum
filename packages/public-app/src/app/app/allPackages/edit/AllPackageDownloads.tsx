import {
  BooleanInput, Datagrid,
  FilterButton, FilterForm, FunctionField, InfiniteList,
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
  packageId: string;
}
export default function AllPackageDownloads (props: IProps) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="packageDownloads"
        filter={{ packageId: props.packageId }}
        sort={{ field: 'createdAt', order: 'DESC' }}
        actions={<Actions/>}
        empty={<div>No downloads for this package :(</div>}
        component={'div'}
        perPage={25}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(id) => `${id}/basic`}
        >
          <FunctionField
            source="createdAt"
            label="Time"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <TextField
            source="versionTag"
            label="Version"
          />
          <FunctionField
            source="userId"
            label="By"
            render={(record: {userFirstName: string, userLastName: string}) => (
              <div>
                {record.userFirstName}
                {' '}
                {record.userLastName}
              </div>
            )}
          />
          <TextField
            source="ip"
            label="IP"
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
