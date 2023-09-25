import { Admin, CustomRoutes } from 'react-admin'
import { Navigate, Route, useParams } from 'react-router-dom'
import { useMemo } from 'react'

import { customAuthProvider } from '@/lib/providers/auth/authProvider'
import CustomLayout from '@/app/app/layout/CustomLayout'
import { createCustomDataProvider } from '@/lib/providers/data/dataProvider'
import { queryClient } from '@/lib/clients/query/client'
import AllUserRouter from '@/app/app/allUsers/AllUserRouter'
import { theme } from './theme'

function LoginRedirect () {
  return (
    <Navigate
      to={'/login'}
      replace={true}
    />
  )
}

export default function App () {
  const { orgId } = useParams()
  const dataProvider = useMemo(
    () => createCustomDataProvider(orgId),
    [orgId]
  )

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
