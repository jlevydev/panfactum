import type { ReactNode } from 'react'
import { lazy, Suspense } from 'react'

import type { IBaseModalProps } from '@/components/modals/BaseModal'
const BaseModal = lazy(() => import('./BaseModal'))

export default function BaseModalLazy ({ children, ...props }: IBaseModalProps & {children: ReactNode}) {
  return (
    <Suspense>
      <BaseModal {...props}>
        {children}
      </BaseModal>
    </Suspense>
  )
}
