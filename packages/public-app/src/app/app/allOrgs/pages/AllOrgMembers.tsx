import AllOrgRoles from '@/app/app/allOrgs/pages/AllOrgRoles'
import OrgMemberList from '@/app/app/commonPages/orgs/OrgMemberList'
import TabNavigation from '@/components/layout/TabNavigation'

interface IAllOrgMembersProps {
  orgId: string;
}
export default function IAllOrgMembers (props: IAllOrgMembersProps) {
  return (
    <div>
      <TabNavigation
        nested
        defaultPath={'list'}
        tabs={[
          {
            label: 'List',
            path: 'list',
            element: (
              <OrgMemberList
                orgId={props.orgId}
                isAdminView={true}
              />
            )
          },
          {
            label: 'Roles',
            path: 'roles',
            element: <AllOrgRoles orgId={props.orgId}/>
          }
        ]}
      />
    </div>
  )
}
