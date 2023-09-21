import { Layout, LayoutProps } from 'react-admin'
import Sidebar from '@/app/app/layout/Sidebar'
import CustomAppBar from '@/app/app/layout/CustomAppBar'

export default function CustomLayout (props: LayoutProps) {
  return (
    <Layout
      {...props}
      menu={Sidebar}
      appBar={CustomAppBar}
    />
  )
}
