import Link from 'next/link'
import { OrganizationSelector } from './organizationSelector'
import { useContext } from 'react'
import { ActiveOrganizationContext } from '../../../../lib/contexts/ActiveOrganizationContext'
import { usePathname } from 'next/navigation'
import { useIdentityQuery } from '../../../../../src/lib/hooks/queries/useIdentityQuery'
import { useUserOrganizationsQuery } from '@/lib/hooks/queries/useUserOrganizationsQuery'

interface ISidebarLinkProps {
  text: string
  href: string
}
function SidebarLink ({ text, href }: ISidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={`text-2xl py-2 pl-4 pr-16 hover:bg-neutral ${isActive ? 'bg-neutral' : ''}`}
    >
      {text}
    </Link>
  )
}

function SidebarHr () {
  return <hr className="border-top-2 border-secondary m-2"/>
}

export function Sidebar () {
  const { activeOrganizationId } = useContext(ActiveOrganizationContext)

  const { data: orgs } = useUserOrganizationsQuery()
  const authInfo = useIdentityQuery()

  const shouldShowAdminLinks = authInfo.isAuthenticated && authInfo.panfactumRole !== null
  const shouldShowOrgSettings = Boolean(orgs && !orgs
    .find(org => org.id === activeOrganizationId)
    ?.isUnitary)

  return (
    <div
      className="bg-white border-r-4 border-r-base-300 flex flex-col max-w-xs
    "
    >
      <OrganizationSelector/>
      <SidebarHr/>
      <SidebarLink
        href={`/app/${activeOrganizationId}/subscriptions`}
        text="Subscriptions"
      />
      <SidebarLink
        href={`/app/${activeOrganizationId}/billing`}
        text="Billing"
      />
      <SidebarHr/>
      <SidebarLink
        href={`/app/${activeOrganizationId}/storefronts`}
        text="Storefronts"
      />
      <SidebarLink
        href={`/app/${activeOrganizationId}/packages`}
        text="Packages"
      />
      <SidebarLink
        href={`/app/${activeOrganizationId}/repos`}
        text="Repos"
      />
      <SidebarLink
        href={`/app/${activeOrganizationId}/payments`}
        text="Payments"
      />

      {shouldShowOrgSettings && (
        <>
          <SidebarHr/>
          <SidebarLink
            href={`/app/${activeOrganizationId}/team`}
            text="Team"
          />
          <SidebarLink
            href={`/app/${activeOrganizationId}/settings`}
            text="Settings"
          />
        </>
      )}

      {shouldShowAdminLinks && (
          <>
            <SidebarHr/>
            <SidebarLink
              href={'/app/admin/find'}
              text="Find"
            />
          </>
        )}
    </div>
  )
}
