import { useParams } from 'react-router-dom'
import TabNavigation from '@/components/TabNavigation'
import AllUserBasic from '@/app/app/allUsers/edit/AllUserBasic'
import AllUserAuth from '@/app/app/allUsers/edit/AllUserAuth'
import AllUserOrgs from '@/app/app/allUsers/edit/AllUserOrgs'
import AllUserSubs from '@/app/app/allUsers/edit/AllUserSubs'
import AllUserAudit from '@/app/app/allUsers/edit/AllUserAudit'

export default function AllUserEdit () {
  const { userId } = useParams()
  if (!userId) {
    return null
  }

  return (
    <div className="pt-4">
      <TabNavigation
        defaultPath={'basic'}
        tabs={[
          {
            label: 'Basic',
            path: 'basic',
            element: <AllUserBasic userId={userId}/>
          },
          {
            label: 'Auth',
            path: 'auth',
            element: <AllUserAuth userId={userId}/>
          },
          {
            label: 'Organizations',
            path: 'orgs',
            element: <AllUserOrgs userId={userId}/>
          },
          {
            label: 'Subscriptions',
            path: 'subs',
            element: <AllUserSubs userId={userId}/>
          },
          {
            label: 'Audit',
            path: 'audit',
            element: <AllUserAudit userId={userId}/>
          }
        ]}
      />
    </div>
  )
}
