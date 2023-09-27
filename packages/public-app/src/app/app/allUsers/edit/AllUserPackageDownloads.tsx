import {
  BooleanInput, Datagrid, FilterButton, FilterForm,
  FunctionField, InfiniteList,
  TextField
} from 'react-admin'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import type { AllPackageDownloadResultType } from '@panfactum/primary-api'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)

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

interface IProps {
  userId: string;
}
export default function AllUserPackageDownloads (props: IProps) {
  const basePath = useAdminBasePath()
  return (
    <div className="p-4">
      <InfiniteList
        resource="allPackageDownloads"
        filter={{ userId: props.userId }}
        sort={{ field: 'createdAt', order: 'DESC' }}
        actions={<UserListActions/>}
        empty={<div>No associated sessions</div>}
        perPage={25}
        component={'div'}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(_, __, record) => {
            return `${basePath}/allPackages/${(record as AllPackageDownloadResultType).packageId}`
          }}
          optimized
        >
          <FunctionField
            source="createdAt"
            label="Time"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <TextField
            source="packageName"
            label="Package"
          />
          <TextField
            source="versionTag"
            label="Version"
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
