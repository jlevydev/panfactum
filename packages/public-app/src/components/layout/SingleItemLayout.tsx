import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import InfoIcon from '@mui/icons-material/Info'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import type { Theme } from '@mui/material'
import { Drawer, Fab, Paper, useMediaQuery } from '@mui/material'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Title, useSidebarState } from 'react-admin'

import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'
import { useLocalStorage } from '@/lib/hooks/state/useLocalStorage'

export interface ISingleItemLayoutProps{
  children: ReactElement
  aside: ReactElement
  asideStateKey: string
  title: string;
  id: string;
}

export default function SingleItemLayout (props: ISingleItemLayoutProps) {
  const {
    children,
    aside,
    asideStateKey,
    title,
    id
  } = props

  const isXSmall = useMediaQuery<Theme>(theme =>
    theme.breakpoints.down('sm')
  )
  const [isSidebarOpen] = useSidebarState()
  const [isAsideOpen, setIsAsideOpen] = useLocalStorage<boolean>(asideStateKey, !isXSmall)
  const [lastIsXSmall, setLastIsXSmall] = useState<boolean>(isXSmall)

  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>([isSidebarOpen, isAsideOpen])

  // This is used to dynamically adjust the width of the main content container based on whether the main
  // menu nav sidebar is open or not. This is required to ensure that we can get horizontal scroll working
  // in subcomponents such as with the tab nav
  const width = isXSmall ? 'calc(100vw - 16px)' : `calc(100vw - ${(isSidebarOpen ? 240 : 55) + 16}px)`

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
    <>
      <Title
        title={(
          <div className="flex flex-row flex-wrap items-baseline gap-x-4">
            <h1 className="text-xl lg:text-2xl">
              {title}
            </h1>
            <div className="text-xs lg:text-sm flex gap-x-2 items-baseline">
              <span className="hidden sm:inline">
                {id}
              </span>
              <Tooltip title="Copy ID to clipboard">
                <ContentCopyIcon
                  fontSize={'10px' as 'small'}
                  onClick={() => {
                    void navigator.clipboard.writeText(id)
                  }}
                />
              </Tooltip>
            </div>
          </div>
        )}
      />
      <div
        className="pt-4 flex flex-col gap-2"
        style={{
          width
        }}
      >

        <div
          ref={contentRef}
          className="flex"
        >
          <div
            className="ease-linear duration-200"
            style={{
              [isXSmall ? 'height' : 'maxHeight']: distanceFromBottom === 0 ? 'initial' : `${distanceFromBottom - 16}px`,
              width: (!isXSmall && isAsideOpen) ? 'calc(100% - 240px)' : '100%',
              transitionProperty: 'width'
            }}
          >
            <Paper
              variant={'outlined'}
              className="relative h-full"
            >
              {!isXSmall
                ? (
                  <Tooltip title={isAsideOpen ? 'Expand main content' : 'Show side panel'}>
                    <Button
                      className="bg-primary min-h-0 min-w-0 py-[4px] px-[4px] text-white absolute -top-[10px] -right-[7px] rounded-[10px]"
                      onClick={() => setIsAsideOpen(!isAsideOpen)}
                    >
                      {isAsideOpen ? <OpenInFullIcon className="text-[12px]"/> : <CloseFullscreenIcon className="text-[12px]" />}
                    </Button>
                  </Tooltip>
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
          {isXSmall
            ? (
              <Drawer
                anchor="right"
                open={isAsideOpen}
                onClose={() => setIsAsideOpen(false)}
              >
                <div
                  className="h-screen p-4 w-[240px]"
                >
                  {aside}
                </div>
              </Drawer>
            )
            : (
              <div
                className={`duration-200 ease-linear transition-all overflow-hidden ${isAsideOpen ? 'pl-3' : 'pl-0'}`}
                style={{
                  width: isAsideOpen ? '240px' : 0
                }}
              >
                <div>
                  {aside}
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  )
}
