'use client'

import type { ReactElement } from 'react'
import { memo } from 'react'

import { useSetTitle } from '@/lib/hooks/ui/useSetTitle'

export interface IMainListLayoutProps {
  children: ReactElement
  title: string;
}

export default memo(function MainListLayout (props: IMainListLayoutProps) {
  const {
    children,
    title
  } = props

  useSetTitle(title)
  return (
    <>
      {children}
    </>
  )
})
