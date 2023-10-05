import type { Theme } from '@mui/material'
import { useMediaQuery } from '@mui/material'
import type { ReactElement } from 'react'
import { Title, useSidebarState } from 'react-admin'

export interface IMainListLayoutProps {
  children: ReactElement
  title: string;
}

export default function MainListLayout (props: IMainListLayoutProps) {
  const {
    children,
    title
  } = props

  const isXSmall = useMediaQuery<Theme>(theme =>
    theme.breakpoints.down('sm')
  )
  const [isSidebarOpen] = useSidebarState()

  // This is used to dynamically adjust the width of the main content container based on whether the main
  // menu nav sidebar is open or not. This is required to ensure that we can get horizontal scroll working
  // in subcomponents such as with the tab nav
  const width = isXSmall ? 'calc(100vw - 16px)' : `calc(100vw - ${(isSidebarOpen ? 240 : 55) + 16}px)`

  return (
    <>
      <Title
        title={(
          <div className="flex flex-row flex-wrap items-baseline gap-x-4">
            <h1 className="text-xl lg:text-2xl">
              {title}
            </h1>
          </div>
        )}
      />
      <div
        className="pt-1"
        style={{
          width
        }}
      >
        {children}
      </div>
    </>
  )
}
