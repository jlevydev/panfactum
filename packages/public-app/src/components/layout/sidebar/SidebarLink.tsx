import MenuItem from '@mui/material/MenuItem'
import Link from 'next/link'
import type { ReactElement } from 'react'
import { memo, useContext } from 'react'

import DefaultTooltip from '@/components/tooltip/DefaultTooltip'
import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'

interface SidebarLinkProps {
  path: string;
  text: string;
  Icon: ReactElement
}

export default memo(function SidebarLink ({ path, text, Icon }: SidebarLinkProps) {
  const matches = null // TODO: FIX
  const { open } = useContext(SidebarOpenContext)
  return (
    <DefaultTooltip
      title={text}
      disableFocusListener={open}
      disableHoverListener={open}
    >
      <Link
        href={path}
        className="no-underline text-black"
      >
        <MenuItem
          className="flex px-2 text-sm lg:text-base xl:text-lg py-1.5 lg:py-2 min-h-0"
          selected={matches !== null}
        >
          {Icon}
          {open && (
            <div className="pl-4">
              {text}
            </div>
          )}
        </MenuItem>
      </Link>
    </DefaultTooltip>
  )
})
