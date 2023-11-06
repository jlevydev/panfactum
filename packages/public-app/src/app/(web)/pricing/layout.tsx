import type { ReactNode } from 'react'

import ArticleLayout from '@/components/layout/web/article/base/ArticleLayout'
import SecondaryWebLayout from '@/components/layout/web/secondary/SecondaryWebLayout'

const TABS = [
  {
    text: 'Maintainers',
    href: '/pricing/maintainers'
  },
  {
    text: 'Subscribers',
    href: '/pricing/subscribers'
  }
]

export default function Layout (
  { children } : {children: ReactNode}
) {
  return (
    <SecondaryWebLayout tabs={TABS}>
      <ArticleLayout>
        {children}
      </ArticleLayout>
    </SecondaryWebLayout>
  )
}
