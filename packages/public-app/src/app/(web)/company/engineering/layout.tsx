import type { ReactNode } from 'react'

import ArticleWithSideNavLayout from '@/components/layout/web/article/withNav/ArticleWithNavLayout'

const SIDENAV_SECTIONS = [
  {
    text: 'Getting Started',
    path: '/getting-started',
    sub: [
      {
        text: 'Overview',
        path: '/overview'
      },
      {
        text: 'Account Provisioning',
        path: '/account-provisioning'
      },
      {
        text: 'Local Setup',
        path: '/local-setup'
      }
    ]
  },
  {
    text: 'Concepts',
    path: '/concepts',
    sub: [
      {
        text: 'Access Control',
        path: '/access-control',
        sub: [
          {
            text: 'Identity Provider',
            path: '/idp'
          },
          {
            text: 'Roles',
            path: '/roles'
          }
        ]
      }
    ]
  },
  {
    text: 'Guides',
    path: '/guides',
    sub: [
      {
        text: 'Access Control',
        path: '/access-control',
        sub: [
          {
            text: 'New User Setup',
            path: '/new-user-setup'
          }
        ]
      }
    ]
  },
  {
    text: 'Reference',
    path: '/reference',
    sub: []
  }
]

export default function Layout (
  { children } : {children: ReactNode}
) {
  return (
    <ArticleWithSideNavLayout
      navSections={SIDENAV_SECTIONS}
      basePath={'/company/engineering'}
    >
      {children}
    </ArticleWithSideNavLayout>
  )
}
