import TimeFromNowField from '@/components/fields/time/TimeFromNowField'

interface IEditItemHeaderProps {
  name: string
  status: string;
  updatedAt?: number | null;
  deletedAt?: number | null;
  createdAt?: number | null;
}
export default function EditItemHeader (props : IEditItemHeaderProps) {
  const {
    name,
    status,
    updatedAt = null,
    deletedAt = null,
    createdAt = null
  } = props
  return (
    <div className="flex lg:items-end justify-between">
      <h1 className="text-xl lg:text-2xl">
        {name}
      </h1>
      <div className="gap-4 text-base hidden lg:flex">
        <div className="font-medium">
          Status:
          {' '}
          {status}
        </div>

        {createdAt !== null && (
          <div className="hidden xl:flex gap-4">
            <div className="w-0.5 bg-secondary"/>
            <div className="font-medium flex gap-2">
              Created:
              <TimeFromNowField unixSeconds={createdAt}/>
            </div>

          </div>
        )}
        <div className="w-0.5 bg-secondary"/>
        {deletedAt === null
          ? (
            <div className="font-medium flex gap-2">
              Updated:
              <TimeFromNowField unixSeconds={updatedAt}/>
            </div>
          )
          : (
            <div className="font-medium flex gap-2">
              Deactivated:
              <TimeFromNowField unixSeconds={deletedAt}/>
            </div>
          )}
      </div>
    </div>
  )
}
