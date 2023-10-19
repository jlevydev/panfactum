import { Outlet, Route, Routes } from 'react-router-dom'

import AllOrgRoleEdit from '@/app/app/allOrgs/pages/AllOrgRoleEdit'
import OrgMemberList from '@/app/app/commonPages/orgs/OrgMemberList'
import OrgRoleList from '@/app/app/commonPages/roles/OrgRoleList'
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
            element: (
              <>
                <Routes>
                  <Route
                    index
                    element={(
                      <OrgRoleList
                        orgId={props.orgId}
                        isAdminView={true}
                      />
                    )}
                  />
                  <Route
                    path=":roleId/*"
                    element={<AllOrgRoleEdit/>}
                  />
                </Routes>
                <Outlet/>
              </>
            )
          }
        ]}
      />
    </div>
  )
}
