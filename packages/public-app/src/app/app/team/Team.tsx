import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import OrgMemberList from '@/app/app/commonPages/orgs/OrgMemberList'
import TeamRoles from '@/app/app/team/TeamRoles'
import TabNavigation from '@/components/layout/TabNavigation'
import { useHasPermissions } from '@/lib/hooks/queries/useHasPermissions'

export default function Team () {
  const { orgId } = useParams()

  const check = useMemo(() => ({ hasOneOf: ['write:membership', 'read:membership'] }), [])
  const isAuthorized = useHasPermissions(check)
  if (!orgId) {
    return null
  } else if (!isAuthorized) {
    // TODO: Create a not authorized page!
    return (
      <div>
        Not authorized!
      </div>
    )
  }
  return (
    <div>
      <TabNavigation
        defaultPath={'members'}
        tabs={[
          {
            label: 'Members',
            path: 'members',
            element: (
              <OrgMemberList
                isAdminView={false}
                orgId={orgId}
              />
            )
          },
          {
            label: 'Roles',
            path: 'roles',
            element: <TeamRoles orgId={orgId}/>
          }
        ]}
      />
    </div>
  )
}
