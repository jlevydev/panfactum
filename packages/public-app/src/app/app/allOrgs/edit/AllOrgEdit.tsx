import { useParams } from 'react-router-dom'

import AllOrgBasic from '@/app/app/allOrgs/edit/AllOrgBasic'
import AllOrgMembers from '@/app/app/allOrgs/edit/AllOrgMembers'
import AllOrgPackages from '@/app/app/allOrgs/edit/AllOrgPackages'
import SingleItemLayout from '@/components/layout/SingleItemLayout'
import TabNavigation from '@/components/layout/TabNavigation'
import { useGetOneOrganization } from '@/lib/hooks/queries/useGetOneOrganization'

function AllOrgEditRendered ({ orgId }: {orgId: string}) {
  const { data } = useGetOneOrganization(orgId)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { id, name } = data

  return (
    <SingleItemLayout
      title={name}
      id={id}
      asideStateKey="all-org-edit-aside"
      aside={<div/>}
    >
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
    </SingleItemLayout>
  )
}

export default function AllOrgEdit () {
  const { orgId } = useParams()
  if (!orgId) {
    return null
  }
  return <AllOrgEditRendered orgId={orgId}/>
}
