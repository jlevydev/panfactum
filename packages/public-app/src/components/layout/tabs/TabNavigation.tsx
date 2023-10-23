'use client'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Link from 'next/link'
import { redirect, useSelectedLayoutSegment } from 'next/navigation'
import type { ReactNode } from 'react'

import GenericMemo from '@/components/util/GenericMemo'

// Renders the tabbed navigation page
interface TabConfig {
  label: string,
  path: string
}
interface ITabNavigationProps<T extends TabConfig> {
  nested?: boolean
  tabs: Array<T>
  basePath: string;
  children: ReactNode
  defaultPath: T['path']
}
export default GenericMemo(function TabNavigation<T extends TabConfig> (props: ITabNavigationProps<T>) {
  const { tabs, nested = false, children, basePath, defaultPath } = props
  const segment = useSelectedLayoutSegment()

  if (segment === null) {
    redirect(`${basePath}/${defaultPath}`)
  }

  return (
    <div className="flex flex-col w-full">
      <div className={`border-b-2 border-solid border-base-100 flex items-center w-full ${nested ? '' : ''}`}>
        <Tabs
          value={segment}
          aria-label="tab navigation"
          variant="scrollable"
          scrollButtons="auto"
          className="h-[35px] min-h-[35px]"
        >
          {tabs.map(({ label, path }) => (
            <Tab
              key={path}
              id={`nav-tab-${path}`}
              aria-controls={'nav-tabpanel'}
              disableRipple
              label={label}
              value={path}
              href={`${basePath}/${path}`}
              component={Link}
              className={`normal-case text-black min-h-[35px] h-[35px] min-w-[40px] lg:min-w-[60px] px-4 lg:px-6 py-2 lg:py-4 ${nested ? 'text-xs lg:text-base xl:text-lg' : 'text-sm lg:text-lg xl:text-xl'}`}
            />
          ))}
        </Tabs>
      </div>
      <div
        role="tabpanel"
        className="w-full"
      >
        { children}
      </div>
    </div>
  )
})
