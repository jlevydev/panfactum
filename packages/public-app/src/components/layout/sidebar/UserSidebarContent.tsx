'use client'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import GitHubIcon from '@mui/icons-material/GitHub'
import GroupsIcon from '@mui/icons-material/Groups'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import SettingsIcon from '@mui/icons-material/Settings'
import StorefrontIcon from '@mui/icons-material/Storefront'
import TerminalIcon from '@mui/icons-material/Terminal'
import { memo } from 'react'

import SidebarLabel from '@/components/layout/sidebar/SidebarLabel'
import SidebarLink from '@/components/layout/sidebar/SidebarLink'

interface IUserSidebarContentProps {
  orgId: string,
  permissions: string[],
  isUnitary: boolean
}

export default memo(function UserSidebarContent (props: IUserSidebarContentProps) {
  const { orgId, permissions, isUnitary } = props

  const permissionsSet = new Set(permissions)
  const isOrgAdmin = permissionsSet.has('admin')

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
    <>
      {(shouldShowSubscriptions || shouldShowSubscriptionBilling) && <SidebarLabel label="Purchasing"/>}
      { shouldShowSubscriptions && (
        <SidebarLink
          path={`/a/o/${orgId}/subscriptions`}
          text="Subscriptions"
          Icon={<TerminalIcon/>}
        />
      )}
      { shouldShowSubscriptionBilling && (
        <SidebarLink
          path={`/a/o/${orgId}/billing`}
          text="Billing"
          Icon={<CreditCardIcon/>}
        />
      )}

      {(shouldShowStorefronts || shouldShowPackages || shouldShowRepos || shouldShowStorefrontBilling) && <SidebarLabel label="Selling"/>}
      { shouldShowStorefronts && (
        <SidebarLink
          path={`/a/o/${orgId}/storefronts`}
          text="Storefronts"
          Icon={<StorefrontIcon/>}
        />
      )}
      { shouldShowPackages && (
        <SidebarLink
          path={`/a/o/${orgId}/packages`}
          text="Packages"
          Icon={<CloudUploadIcon/>}
        />
      )}
      { shouldShowRepos && (
        <SidebarLink
          path={`/a/o/${orgId}/repos`}
          text="Repos"
          Icon={<GitHubIcon/>}
        />
      )}
      { shouldShowStorefrontBilling && (
        <SidebarLink
          path={`/a/o/${orgId}/payments`}
          text="Payments"
          Icon={<PointOfSaleIcon/>}
        />
      )}

      {(shouldShowTeam || shouldShowSettings) && <SidebarLabel label="Org Management"/>}
      { shouldShowTeam && (
        <SidebarLink
          path={`/a/o/${orgId}/team`}
          text="Team"
          Icon={<GroupsIcon/>}
        />
      )}

      { shouldShowSettings && (
        <SidebarLink
          path={`/a/o/${orgId}/settings`}
          text="Settings"
          Icon={<SettingsIcon/>}
        />
      )}
    </>
  )
})
