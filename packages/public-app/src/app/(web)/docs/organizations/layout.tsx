import FlagIcon from '@mui/icons-material/Flag'
import GavelIcon from '@mui/icons-material/Gavel'
import type { ReactNode } from 'react'

import ArticleWithSideNavLayout from '@/components/layout/web/article/withNav/ArticleWithNavLayout'

const SIDENAV_SECTIONS = [
  {
    text: 'Getting Started',
    basePath: '/docs/organizations',
    path: '/getting-started',
    icon: <FlagIcon/>,
    sub: [
      {
        text: 'Setup',
        path: '/setup'
      }
    ]
  },
  {
    text: 'Permissions',
    path: '/permissions',
    icon: <GavelIcon/>,
    sub: [
      {
        text: 'Roles',
        path: '/roles'
      },
      {
        text: 'Test',
        path: '/test',
        sub: [
          {
            text: 'Sub Test',
            path: '/test'
          }
        ]

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
      basePath={'/docs/organizations'}
    >
      {children}
    </ArticleWithSideNavLayout>
  )
}
