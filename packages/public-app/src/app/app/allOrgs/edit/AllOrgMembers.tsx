import TabNavigation from '@/components/TabNavigation'
import AllOrgMemberList from '@/app/app/allOrgs/edit/AllOrgMemberList'
import AllOrgRoles from '@/app/app/allOrgs/edit/AllOrgRoles'

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
            element: <AllOrgMemberList orgId={props.orgId}/>
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
