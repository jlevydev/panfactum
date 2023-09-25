import { Outlet, Route, Routes } from 'react-router-dom'
import AllUserList from '@/app/app/allUsers/AllUserList'
import AllUserEdit from '@/app/app/allUsers/edit/AllUserEdit'

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
