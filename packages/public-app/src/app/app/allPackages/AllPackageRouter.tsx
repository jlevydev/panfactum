import { Outlet, Route, Routes } from 'react-router-dom'

import AllPackageList from '@/app/app/allPackages/AllPackageList'
import AllPackageEdit from '@/app/app/allPackages/edit/AllPackageEdit'

export default function AllPackageRouter () {
  return (
    <>
      <Routes>
        <Route
          index
          element={<AllPackageList/>}
        />
        <Route
          path=":packageId/*"
          element={<AllPackageEdit/>}
        />
      </Routes>
      <Outlet/>
    </>
  )
}
