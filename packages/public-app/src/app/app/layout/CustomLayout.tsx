import type { LayoutProps } from 'react-admin'
import { Layout } from 'react-admin'

import CustomAppBar from '@/app/app/layout/CustomAppBar'
import Sidebar from '@/app/app/layout/Sidebar'

export default function CustomLayout (props: LayoutProps) {
  return (
    <Layout
      {...props}
      menu={Sidebar}
      appBar={CustomAppBar}
      sx={{
        '& .RaLayout-appFrame': {
          marginTop: 0
        }
      }}
    />
  )
}
