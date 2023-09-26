import { useParams } from 'react-router-dom'
import TabNavigation from '@/components/TabNavigation'
import AllOrgBasic from '@/app/app/allOrgs/edit/AllOrgBasic'
import AllOrgMembers from '@/app/app/allOrgs/edit/AllOrgMembers'
import AllOrgPackages from '@/app/app/allOrgs/edit/AllOrgPackages'
import { useAllOrganizationGetOne } from '@/lib/hooks/queries/useAllOrganizationGetOne'
import EditItemHeader from '@/components/headers/EditItemHeader'

function AllOrgEditRendered ({ orgId }: {orgId: string}) {
  const { data } = useAllOrganizationGetOne(orgId)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { name, isDeleted, updatedAt, deletedAt, createdAt } = data

  return (
    <div className="pt-4 flex flex-col gap-2">
      <EditItemHeader
        name={name}
        status={!isDeleted ? 'Active' : 'Inactive'}
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
            element: <AllOrgBasic orgId={orgId}/>
          },
          {
            label: 'Members',
            path: 'members',
            element: <AllOrgMembers orgId={orgId}/>
          },
          {
            label: 'Packages',
            path: 'packages',
            element: <AllOrgPackages orgId={orgId}/>
          }
        ]}
      />
    </div>
  )
}

export default function AllOrgEdit () {
  const { orgId } = useParams()
  if (!orgId) {
    return null
  }
  return <AllOrgEditRendered orgId={orgId}/>
}
