'use client'

import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import InventoryIcon from '@mui/icons-material/Inventory'
import RecentActorsRoundedIcon from '@mui/icons-material/RecentActorsRounded'
import { memo } from 'react'

import SidebarLabel from '@/components/layout/sidebar/SidebarLabel'
import SidebarLink from '@/components/layout/sidebar/SidebarLink'

export default memo(function AdminSidebarContent () {
  return (
    <>
      <SidebarLabel label="Internal Admin"/>
      <SidebarLink
        path="/a/admin/users"
        text="Users"
        Icon={<RecentActorsRoundedIcon/>}
      />
      <SidebarLink
        path="/a/admin/orgs"
        text="Orgs"
        Icon={<CorporateFareIcon/>}
      />

      <SidebarLink
        path="/a/admin/packages"
        text="Packages"
        Icon={<InventoryIcon/>}
      />
    </>
  )
})
