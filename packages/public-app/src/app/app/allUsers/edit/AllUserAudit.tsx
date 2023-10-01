import AllUserLoginSessions from '@/app/app/allUsers/edit/AllUserLoginSessions'
import AllUserPackageDownloads from '@/app/app/allUsers/edit/AllUserPackageDownloads'
import TabNavigation from '@/components/TabNavigation'

interface IAllUserAuditProps {
  userId: string;
}
export default function AllUserAudit (props: IAllUserAuditProps) {
  return (
    <div>
      <TabNavigation
        nested
        defaultPath={'login'}
        tabs={[
          {
            label: 'Login Sessions',
            path: 'login',
            element: <AllUserLoginSessions userId={props.userId}/>
          },
          {
            label: 'Package Downloads',
            path: 'downloads',
            element: <AllUserPackageDownloads userId={props.userId}/>
          }
        ]}
      />
    </div>
  )
}
