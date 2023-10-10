import { Outlet, Route, Routes } from 'react-router-dom'

import AllUserEdit from '@/app/app/allUsers/pages/AllUserEdit'
import AllUserList from '@/app/app/allUsers/pages/AllUserList'

export default function AllUserRouter () {
  return (
    <>
      <Routes>
        <Route
          index
          element={<AllUserList/>}
        />
        <Route
          path=":userId/*"
          element={<AllUserEdit/>}
        />
      </Routes>
      <Outlet/>
    </>
  )
}
