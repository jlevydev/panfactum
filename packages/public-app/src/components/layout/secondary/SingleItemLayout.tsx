import Paper from '@mui/material/Paper'
import type { ReactNode } from 'react'
import { memo, useContext } from 'react'

import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'
import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'
import useIsXSmall from '@/lib/hooks/ui/useIsXSmall'
import { useSetTitle } from '@/lib/hooks/ui/useSetTitle'

export interface ISingleItemLayoutProps{
  children: ReactNode
  title?: string;
  id?: string;
}

export default memo(function SingleItemLayout (props: ISingleItemLayoutProps) {
  const {
    children,
    title,
    id
  } = props

  const isXSmall = useIsXSmall()
  const { open: isSidebarOpen } = useContext(SidebarOpenContext)
  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>([isSidebarOpen])

  useSetTitle(title, id)

  return (
    <div
      ref={contentRef}
      className="p-2 flex gap-2 w-full"
      style={{
        [isXSmall ? 'height' : 'maxHeight']: distanceFromBottom === 0 ? 'initial' : `${distanceFromBottom - 16}px`
      }}
    >
      <Paper
        variant='outlined'
        className="relative h-full w-full"
      >
        {children}
      </Paper>
    </div>
  )
})
