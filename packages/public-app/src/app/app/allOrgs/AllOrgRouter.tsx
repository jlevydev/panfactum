import { Outlet, Route, Routes } from 'react-router-dom'
import AllOrgList from '@/app/app/allOrgs/AllOrgList'
import AllOrgEdit from '@/app/app/allOrgs/edit/AllOrgEdit'

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
