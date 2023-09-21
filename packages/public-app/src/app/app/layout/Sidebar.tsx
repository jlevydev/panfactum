import { Menu } from 'react-admin'
import LabelIcon from '@mui/icons-material/Label'
import type { ReactElement } from 'react'
import { useIdentityQuery } from '@/lib/providers/auth/authProvider'
import OrganizationSelector from '@/app/app/layout/OrganizationSelector'
import MenuItem from '@mui/material/MenuItem'
import { Link, useParams } from 'react-router-dom'

function SidebarHr () {
  return <hr className="border-top-2 border-secondary m-2"/>
}

interface SidebarLinkProps {
  path: string;
  text: string;
  Icon?: ReactElement
}

function SidebarLink ({ path, text, Icon }: SidebarLinkProps) {
  return (
    <Link
      to={path}
      className="no-underline text-neutral-600"
    >
      <MenuItem className="flex">
        {Icon && Icon}
        <div className="pl-4">
          {text}
        </div>
      </MenuItem>
    </Link>
  )
}

export default function Sidebar () {
  const { orgId } = useParams()

  const { data: identity } = useIdentityQuery()

  const shouldShowAdminLinks = Boolean(identity && (identity.panfactumRole || identity.masqueradingPanfactumRole))

  return (
    <Menu>
      <OrganizationSelector/>
      <Menu.DashboardItem/>
      <SidebarLink
        path={`/o/${orgId}/allUsers`}
        text="Users"
        Icon={<LabelIcon/>}
      />

      {shouldShowAdminLinks && <SidebarHr/>}
      {shouldShowAdminLinks && (
        <SidebarLink
          path={`/o/${orgId}/allUsers`}
          text="Users"
          Icon={<LabelIcon/>}
        />
      )}
    </Menu>
  )
}
