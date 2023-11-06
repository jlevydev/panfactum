import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import InfoIcon from '@mui/icons-material/Info'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import Paper from '@mui/material/Paper'
import type { ReactNode } from 'react'
import { memo, useContext, useEffect, useState } from 'react'

import DefaultTooltipLazy from '@/components/tooltip/DefaultTooltipLazy'
import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'
import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'
import { useLocalStorage } from '@/lib/hooks/state/useLocalStorage'
import useIsXSmall from '@/lib/hooks/ui/useIsXSmall'
import { useSetTitle } from '@/lib/hooks/ui/useSetTitle'

export const ASIDE_WIDTH = 240

export interface ISingleItemLayoutWithAsideProps {
  children: ReactNode
  aside: ReactNode
  asideStateKey: string
  title?: string;
  id?: string;
}

export default memo(function SingleItemLayoutWithAside (props: ISingleItemLayoutWithAsideProps) {
  const {
    children,
    aside,
    asideStateKey,
    title,
    id
  } = props

  const isXSmall = useIsXSmall()
  const { open: isSidebarOpen } = useContext(SidebarOpenContext)
  const [isAsideOpen, setIsAsideOpen] = useLocalStorage<boolean>(asideStateKey, !isXSmall)
  const [lastIsXSmall, setLastIsXSmall] = useState<boolean>(isXSmall)
  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>([isSidebarOpen, isAsideOpen])

  useSetTitle(title, id)

  // This is used to ensure that we on small screens, the aside drawer starts closed
  useEffect(() => {
    if (lastIsXSmall !== isXSmall) {
      if (isXSmall) {
        setIsAsideOpen(false)
      }
      setLastIsXSmall(isXSmall)
    }
  }, [isXSmall, setLastIsXSmall, lastIsXSmall, setIsAsideOpen])

  return (
    <div
      ref={contentRef}
      className="p-2 pt-3 flex gap-2 w-full"
    >
      <div
        className="ease-linear duration-200"
        style={{
          [isXSmall ? 'height' : 'maxHeight']: distanceFromBottom === 0 ? 'initial' : `${distanceFromBottom - 16}px`,
          width: (!isXSmall && isAsideOpen) ? `calc(100% - ${ASIDE_WIDTH}px)` : '100%',
          transitionProperty: 'width'
        }}
      >
        <Paper
          variant='outlined'
          className="relative h-full"
        >
          {!isXSmall
            ? (
              <DefaultTooltipLazy title={isAsideOpen ? 'Expand main content' : 'Show side panel'}>
                <Button
                  className="bg-primary min-h-0 min-w-0 py-[4px] px-[4px] text-white absolute -top-[10px] -right-[7px] rounded-[10px]"
                  onClick={() => setIsAsideOpen(!isAsideOpen)}
                >
                  {isAsideOpen ? <OpenInFullIcon className="text-[12px]"/> : <CloseFullscreenIcon className="text-[12px]" />}
                </Button>
              </DefaultTooltipLazy>
            )
            : (
              <Fab
                size="small"
                className="absolute bottom-2 right-2"
                onClick={() => setIsAsideOpen(!isAsideOpen)}
              >
                <InfoIcon/>
              </Fab>
            )}

          {children}
        </Paper>
      </div>
      {aside && (
        isXSmall
          ? (
            <Drawer
              anchor="right"
              open={isAsideOpen}
              onClose={() => setIsAsideOpen(false)}
            >
              <div
                className="h-screen p-4"
                style={{ width: ASIDE_WIDTH }}
              >
                {aside}
              </div>
            </Drawer>
          )
          : (
            <Collapse
              collapsedSize={0}
              orientation={'horizontal'}
              in={isAsideOpen}
            >
              <div
                className="pl-4"
                style={{ width: ASIDE_WIDTH }}
              >
                {aside}
              </div>
            </Collapse>
          )
      )}

    </div>
  )
})
