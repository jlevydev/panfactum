import { Outlet, Route, Routes } from 'react-router-dom'

import AllOrgEdit from '@/app/app/allOrgs/pages/AllOrgEdit'
import AllOrgList from '@/app/app/allOrgs/pages/AllOrgList'

export default function AllOrgRouter () {
  return (
    <>
      <Routes>
        <Route
          index
          element={<AllOrgList/>}
        />
        <Route
          path=":orgId/*"
          element={<AllOrgEdit/>}
        />
      </Routes>
      <Outlet/>
    </>
  )
}
