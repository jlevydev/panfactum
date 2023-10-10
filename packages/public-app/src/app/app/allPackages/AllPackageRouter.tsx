import { Outlet, Route, Routes } from 'react-router-dom'

import AllPackageEdit from '@/app/app/allPackages/pages/AllPackageEdit'
import AllPackageList from '@/app/app/allPackages/pages/AllPackageList'

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
