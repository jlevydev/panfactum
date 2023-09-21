import { Admin, Resource, CustomRoutes } from 'react-admin'
import { Navigate, Route, useParams } from 'react-router-dom'
import { useMemo } from 'react'

import { customAuthProvider } from '@/lib/providers/auth/authProvider'
import CustomLayout from '@/app/app/layout/CustomLayout'
import { createCustomDataProvider } from '@/lib/providers/data/dataProvider'
import UserList from '@/app/app/users/UserList'
import { queryClient } from '@/lib/clients/query/client'
import UserEdit from '@/app/app/users/UserEdit'

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
    >
      <Resource
        name="allUsers"
        list={UserList}
        edit={UserEdit}
        recordRepresentation="name"
      />
      <CustomRoutes>
        <Route
          path="/"
          element={(
            <Navigate
              to={`/o/${orgId}/allUsers`}
              replace={true}
            />
          )}
        />
      </CustomRoutes>
    </Admin>

  )
}
