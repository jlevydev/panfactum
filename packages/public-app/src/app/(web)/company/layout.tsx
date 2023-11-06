import type { ReactNode } from 'react'

import SecondaryWebLayout from '@/components/layout/web/secondary/SecondaryWebLayout'

const TABS = [
  {
    text: 'About',
    href: '/company/about'
  },
  {
    text: 'Handbook',
    href: '/company/handbook'
  },
  {
    text: 'Engineering',
    href: '/company/engineering'
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
