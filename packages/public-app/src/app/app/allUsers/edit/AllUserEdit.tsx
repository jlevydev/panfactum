import { useParams } from 'react-router-dom'

import AllUserAudit from '@/app/app/allUsers/edit/AllUserAudit'
import AllUserAuth from '@/app/app/allUsers/edit/AllUserAuth'
import AllUserBasic from '@/app/app/allUsers/edit/AllUserBasic'
import AllUserOrgs from '@/app/app/allUsers/edit/AllUserOrgs'
import AllUserSubs from '@/app/app/allUsers/edit/AllUserSubs'
import TabNavigation from '@/components/TabNavigation'
import EditItemHeader from '@/components/headers/EditItemHeader'
import { useGetOneUser } from '@/lib/hooks/queries/useGetOneUser'

function AllUserEditRendered ({ userId }: {userId: string}) {
  const { data } = useGetOneUser(userId)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { firstName, lastName, isDeleted, updatedAt, deletedAt, createdAt } = data

  return (
    <div className="pt-4 flex flex-col gap-2">
      <EditItemHeader
        name={`${firstName} ${lastName}`}
        status={isDeleted ? 'Disabled' : 'Active'}
        updatedAt={updatedAt}
        deletedAt={deletedAt}
        createdAt={createdAt}
      />
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

export default function AllUserEdit () {
  const { userId } = useParams()
  if (!userId) {
    return null
  }
  return <AllUserEditRendered userId={userId}/>
}
