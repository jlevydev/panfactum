import { Outlet, Route, Routes } from 'react-router-dom'

import OrgRoleList from '@/app/app/commonPages/roles/OrgRoleList'
import TeamRoleEdit from '@/app/app/team/TeamRoleEdit'

export default function TeamRoles ({ orgId }: {orgId: string}) {
  return (
    <>
      <Routes>
        <Route
          index
          element={(
            <OrgRoleList
              orgId={orgId}
              isAdminView={false}
            />
          )}
        />
        <Route
          path=":roleId/*"
          element={<TeamRoleEdit/>}
        />
      </Routes>
      <Outlet/>
    </>
  )
}
