'use client'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { StyledEngineProvider } from '@mui/material/styles'
import { LicenseInfo } from '@mui/x-license-pro'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { theme } from '@/app/app/theme'

// eslint-disable-next-line
LicenseInfo.setLicenseKey(process.env['NEXT_PUBLIC_MUI_X_LICENSE_KEY'] || 'Invalid')

// This disables SSR on all of the children of the component
// tree which is fine b/c we do not want to do any server side
// work on the main app
const DynamicMainRouter = dynamic(
  () => import('./MainRouter'), {
    ssr: false
  })

// This is necessary to avoid pre-rendering in next
// which can cause NEXT_DYNAMIC_NO_SSR_CODE errors
const Dynamic = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])
  if (!hasMounted) {
    return null
  }
  return (
    <>
      {children}
    </>
  )
}

const Home: NextPage = () => (
  <StyledEngineProvider>
    <Dynamic>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DynamicMainRouter />
      </ThemeProvider>
    </Dynamic>
  </StyledEngineProvider>
)

export default Home
