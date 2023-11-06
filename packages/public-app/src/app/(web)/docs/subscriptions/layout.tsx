import type { ReactNode } from 'react'

import ArticleWithSideNavLayout from '@/components/layout/web/article/withNav/ArticleWithNavLayout'

const SIDENAV_SECTIONS = [
  {
    text: 'Overview',
    path: '/overview'
  },
  {
    text: 'Getting Started',
    path: '/getting-started',
    sub: [
      {
        text: 'Setup',
        path: '/setup'
      }
    ]
  }
]

export default function Layout (
  { children } : {children: ReactNode}
) {
  return (
    <ArticleWithSideNavLayout
      navSections={SIDENAV_SECTIONS}
      basePath={'/docs/subscriptions'}
    >
      {children}
    </ArticleWithSideNavLayout>
  )
}
