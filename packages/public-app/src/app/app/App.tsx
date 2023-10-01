import { Admin, CustomRoutes } from 'react-admin'
import { Navigate, Route, useParams } from 'react-router-dom'

import AllOrgRouter from '@/app/app/allOrgs/AllOrgRouter'
import AllPackageRouter from '@/app/app/allPackages/AllPackageRouter'
import AllUserRouter from '@/app/app/allUsers/AllUserRouter'
import CustomLayout from '@/app/app/layout/CustomLayout'
import { queryClient } from '@/lib/clients/query/client'
import { customAuthProvider } from '@/lib/providers/auth/authProvider'
import { createCustomDataProvider } from '@/lib/providers/data/dataProvider'

import { theme } from './theme'

function LoginRedirect () {
  return (
    <Navigate
      to={'/login'}
      replace={true}
    />
  )
}
const dataProvider = createCustomDataProvider()
export default function App () {
  const { orgId } = useParams()

  if (!orgId) {
    return null
  }

  // TODO: If the org id is one that the user does not have access to, redirect to their personal
  // organization

  return (

    <Admin
      dataProvider={dataProvider}
      authProvider={customAuthProvider}
      queryClient={queryClient}
      loginPage={LoginRedirect}
      layout={CustomLayout}
      requireAuth
      basename={`/o/${orgId}`}
      disableTelemetry
      theme={theme}
    >
      <CustomRoutes>
        <Route
          path="allUsers/*"
          element={<AllUserRouter/>}
        />
        <Route
          path="allOrgs/*"
          element={<AllOrgRouter/>}
        />
        <Route
          path="allPackages/*"
          element={<AllPackageRouter/>}
        />
        <Route
          index
          element={(
            <Navigate
              to="allUsers"
              replace={true}
            />
          )}
        />
      </CustomRoutes>
    </Admin>

  )
}
