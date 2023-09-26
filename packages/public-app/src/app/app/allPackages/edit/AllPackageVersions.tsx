import {
  BooleanInput, Datagrid, FilterButton, FilterForm, FunctionField, InfiniteList, NumberField,
  TextField
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import ByteSizeField from '@/components/size/ByteSizeField'

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
export default function AllPackageVersions (props: IProps) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allPackageVersions"
        filter={{ packageId: props.packageId }}
        sort={{ field: 'createdAt', order: 'DESC' }}
        actions={<Actions/>}
        empty={<div>No versions for this package</div>}
        component={'div'}
        perPage={25}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(id) => `${id}/basic`}
        >
          <TextField
            source="versionTag"
            label="Tag"
          />
          <FunctionField
            source="createdAt"
            label="Created"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="createdBy"
            label="By"
            render={(record: {createdByFirstName: string, createdByLastName: string}) => (
              <div>
                {record.createdByFirstName}
                {' '}
                {record.createdByLastName}
              </div>
            )}
          />
          <FunctionField
            source="sizeBytes"
            label="Size"
            render={(record: {sizeBytes: number}) => <ByteSizeField bytes={record.sizeBytes}/>}
          />
          <NumberField
            source="downloadCount"
            label="Downloads"
          />
          <FunctionField
            source="archivedAt"
            label="Archived"
            render={(record: {archivedAt: number | null}) => <TimeFromNowField unixSeconds={record.archivedAt}/>}
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
