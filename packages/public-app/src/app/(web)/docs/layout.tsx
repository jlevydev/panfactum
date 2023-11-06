import type { ReactNode } from 'react'

import SecondaryWebLayout from '@/components/layout/web/secondary/SecondaryWebLayout'

const TABS = [
  {
    text: 'Subscriptions',
    href: '/docs/subscriptions'
  },
  {
    text: 'Storefronts',
    href: '/docs/storefronts'
  },
  {
    text: 'User Profile',
    href: '/docs/profile'
  },
  {
    text: 'Organizations',
    href: '/docs/organizations'
  }
]

export default function Layout (
  { children } : {children: ReactNode}
) {
  return (
    <SecondaryWebLayout tabs={TABS}>
      {children}
    </SecondaryWebLayout>
  )
}
