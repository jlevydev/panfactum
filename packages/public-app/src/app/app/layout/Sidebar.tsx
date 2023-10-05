import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import GitHubIcon from '@mui/icons-material/GitHub'
import GroupsIcon from '@mui/icons-material/Groups'
import InventoryIcon from '@mui/icons-material/Inventory'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import RecentActorsRoundedIcon from '@mui/icons-material/RecentActorsRounded'
import SettingsIcon from '@mui/icons-material/Settings'
import StorefrontIcon from '@mui/icons-material/Storefront'
import TerminalIcon from '@mui/icons-material/Terminal'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import type { ReactElement } from 'react'
import { Menu, useSidebarState } from 'react-admin'
import { Link, Navigate, useMatch, useParams } from 'react-router-dom'

import OrganizationSelector from '@/app/app/layout/OrganizationSelector'
import { useIdentityQuery } from '@/lib/providers/auth/authProvider'

function SidebarLabel ({ label }: {label: string}) {
  const [open] = useSidebarState()
  return (
    <div className="flex mb-1 mt-3 gap-3">
      {open && (
        <div className="uppercase text-sm lg:text-base text-secondary font-bold ">
          {label}
        </div>
      )}
      <div className="border-0 h-0.5 bg-base-300 mx-0 my-3 grow"/>
    </div>
  )
}

interface SidebarLinkProps {
  path: string;
  text: string;
  Icon?: ReactElement
}

function SidebarLink ({ path, text, Icon }: SidebarLinkProps) {
  const matches = useMatch(`${path}/*`)
  const [open] = useSidebarState()
  return (
    <Tooltip
      title={text}
      disableFocusListener={open}
      disableHoverListener={open}
    >
      <Link
        to={path}
        className="no-underline text-black"
      >
        <MenuItem
          className="flex px-2 text-sm lg:text-base py-1.5 lg:py-2 min-h-0"
          selected={matches !== null}
        >
          {Icon && Icon}
          <div className="pl-4">
            {text}
          </div>
        </MenuItem>
      </Link>
    </Tooltip>
  )
}

export default function Sidebar () {
  const { orgId } = useParams()
  const { data: identity } = useIdentityQuery()
  const [open] = useSidebarState()

  if (orgId === undefined || identity === undefined) {
    throw new Error('Tried to render sidebar without orgId or identity set.')
  }

  const currentOrg = identity.organizations.find(org => org.id === orgId)

  if (currentOrg === undefined) {
    // This isn't really the right place to handle this
    console.warn('Current org is set to an organization the user is not a member of')
    return (
      <Navigate
        to='/'
        replace={true}
      />
    )
  }

  const { permissions, isUnitary } = currentOrg

  const permissionsSet = new Set(permissions)
  const isOrgAdmin = permissionsSet.has('admin')

  const shouldShowAdminLinks = Boolean(identity && (identity.panfactumRole || identity.masqueradingPanfactumRole))
  const shouldShowSubscriptions = isOrgAdmin ||
    permissionsSet.has('write:subscription') ||
    permissionsSet.has('read:subscription')
  const shouldShowSubscriptionBilling = isOrgAdmin ||
    permissionsSet.has('write:subscription_billing') ||
    permissionsSet.has('read:subscription_billing')
  const shouldShowStorefronts = !isUnitary &&
    (isOrgAdmin ||
    permissionsSet.has('write:storefront') ||
    permissionsSet.has('read:storefront'))
  const shouldShowPackages = !isUnitary &&
    (isOrgAdmin ||
    permissionsSet.has('write:package') ||
    permissionsSet.has('read:package'))
  const shouldShowRepos = !isUnitary && (
    isOrgAdmin ||
    permissionsSet.has('write:repository') ||
    permissionsSet.has('read:repository'))
  const shouldShowStorefrontBilling = !isUnitary && (
    isOrgAdmin ||
    permissionsSet.has('write:storefront_billing') ||
    permissionsSet.has('read:storefront_billing'))
  const shouldShowTeam = !isUnitary &&
    (isOrgAdmin ||
    permissionsSet.has('write:membership') ||
    permissionsSet.has('read:membership'))
  const shouldShowSettings = !isUnitary &&
    (isOrgAdmin ||
    permissionsSet.has('write:organization') ||
    permissionsSet.has('read:organization'))

  return (
    <Menu className="px-2 h-full bg-base-100 m-0 pt-4">
      <OrganizationSelector collapsed={!open}/>
      {(shouldShowSubscriptions || shouldShowSubscriptionBilling) && <SidebarLabel label="Purchasing"/>}
      { shouldShowSubscriptions && (
        <SidebarLink
          path={`/o/${orgId}/subscriptions`}
          text="Subscriptions"
          Icon={<TerminalIcon/>}
        />
      )}
      { shouldShowSubscriptionBilling && (
        <SidebarLink
          path={`/o/${orgId}/billing`}
          text="Billing"
          Icon={<CreditCardIcon/>}
        />
      )}

      {(shouldShowStorefronts || shouldShowPackages || shouldShowRepos || shouldShowStorefrontBilling) && <SidebarLabel label="Selling"/>}
      { shouldShowStorefronts && (
        <SidebarLink
          path={`/o/${orgId}/storefronts`}
          text="Storefronts"
          Icon={<StorefrontIcon/>}
        />
      )}
      { shouldShowPackages && (
        <SidebarLink
          path={`/o/${orgId}/packages`}
          text="Packages"
          Icon={<CloudUploadIcon/>}
        />
      )}
      { shouldShowRepos && (
        <SidebarLink
          path={`/o/${orgId}/repos`}
          text="Repos"
          Icon={<GitHubIcon/>}
        />
      )}
      { shouldShowStorefrontBilling && (
        <SidebarLink
          path={`/o/${orgId}/payments`}
          text="Payments"
          Icon={<PointOfSaleIcon/>}
        />
      )}

      {(shouldShowTeam || shouldShowSettings) && <SidebarLabel label="Org Management"/>}
      { shouldShowTeam && (
        <SidebarLink
          path={`/o/${orgId}/team`}
          text="Team"
          Icon={<GroupsIcon/>}
        />
      )}

      { shouldShowSettings && (
        <SidebarLink
          path={`/o/${orgId}/settings`}
          text="Settings"
          Icon={<SettingsIcon/>}
        />
      )}

      {shouldShowAdminLinks && <SidebarLabel label="Internal Admin"/>}
      {shouldShowAdminLinks && (
        <SidebarLink
          path={`/o/${orgId}/allUsers`}
          text="Users"
          Icon={<RecentActorsRoundedIcon/>}
        />
      )}
      {shouldShowAdminLinks && (
        <SidebarLink
          path={`/o/${orgId}/allOrgs`}
          text="Orgs"
          Icon={<CorporateFareIcon/>}
        />
      )}
      {shouldShowAdminLinks && (
        <SidebarLink
          path={`/o/${orgId}/allPackages`}
          text="Packages"
          Icon={<InventoryIcon/>}
        />
      )}
    </Menu>
  )
}
