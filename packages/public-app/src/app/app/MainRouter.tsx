'use client'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'

import LoginPage from '@/app/app/auth/LoginPage'
import { fetchAuthInfo } from '@/lib/clients/api/fetchAuthInfo'
import App from '@/app/app/App'
import { queryClient } from '@/lib/clients/query/client'
import { ReactQueryDevtools } from 'react-query/devtools'
import { QueryClientProvider } from 'react-query'

function NavigateToDefaultOrg () {
  const [organizations, setOrganizations] = useState<Awaited<ReturnType<typeof fetchAuthInfo>>['organizations']>([])
  const [isAuthError, setIsAuthError] = useState<boolean>(false)
  useEffect(() => {
    fetchAuthInfo()
      .then(info => {
        setOrganizations(info.organizations)
      })
      .catch(err => {
        console.error(err)
        setIsAuthError(true)
      })
  }, [])

  if (isAuthError) {
    return <Navigate to={'/login'} />
  }

  if (organizations.length === 0) {
    return null
  }

  const personalOrg = organizations
    .find(org => org.isUnitary)

  if (!personalOrg) {
    throw new Error('User does not have a personal organization')
  }

  return (
    <Navigate
      to={`/o/${personalOrg.id}`}
      replace={true}
    />
  )
}

export default function AdminApp () {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={'/app'}>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage/>}
          />
          <Route
            path="/o/:orgId/*"
            element={<App/>}
          />
          <Route
            path="/*"
            element={<NavigateToDefaultOrg />}
          />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
