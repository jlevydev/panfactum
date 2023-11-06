'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import React, { memo, useCallback, useMemo, useState } from 'react'

import FormActionButton from '@/components/form/FormActionButton'
import SingleItemLayoutWithAside from '@/components/layout/app/secondary/SingleItemLayoutWithAside'
import TabNavigation from '@/components/layout/app/tabs/AppTabNavigation'
import ChangeUsersStatusModal from '@/components/modals/ChangeUsersStatusModal'
import { useLogin } from '@/lib/hooks/queries/auth/useLogin'
import { useGetOneUser } from '@/lib/hooks/queries/crud/users'

const TABS = [
  {
    label: 'Basic',
    path: 'basic' as const
  },
  {
    label: 'Auth',
    path: 'auth' as const
  },
  {
    label: 'Organizations',
    path: 'orgs' as const
  },
  {
    label: 'Subscriptions',
    path: 'subs' as const
  },
  {
    label: 'Audit',
    path: 'audit' as const
  }
]

interface LayoutProps {
  children: ReactNode,
  userId: string
}

const ClientLayout = memo(({ children, userId }: LayoutProps) => {
  const { data: user } = useGetOneUser(userId)

  const [reactivateUserModalIsOpen, setReactivateUserModalIsOpen] = useState<boolean>(false)
  const [deactivateUserModalIsOpen, setDeactivateUserModalIsOpen] = useState<boolean>(false)
  const toggleReactivateModal = useCallback(() => {
    setReactivateUserModalIsOpen((prev) => !prev)
  }, [setReactivateUserModalIsOpen])

  const toggleDeactivateModal = useCallback(() => {
    setDeactivateUserModalIsOpen((prev) => !prev)
  }, [setDeactivateUserModalIsOpen])
  const users = useMemo(() => (user ? [user] : []), [user])

  const { mutate: login } = useLogin()
  const router = useRouter()

  const handleMasqueradeClick = useCallback(() => {
    login({ loginMethod: 'masquerade', targetUserId: userId }, {
      onSuccess: () => {
        router.push('/a')
      },
      onError: (e) => {
        console.error(e)
      }
    })
  }, [login, userId, router])

  if (!user) {
    return null
  }

  const { firstName, lastName, id, isDeleted } = user

  return (
    <SingleItemLayoutWithAside
      title={`${firstName} ${lastName}`}
      id={id}
      asideStateKey="all-user-edit-aside"
      aside={(
        <div className="flex flex-col">
          <h3>User Actions</h3>
          <div className="flex flex-row flex-wrap gap-x-4">
            {isDeleted
              ? (
                <>
                  <FormActionButton
                    tooltipText="Reactivate the user"
                    actionType="danger"
                    onClick={toggleReactivateModal}
                  >
                    Reactivate
                  </FormActionButton>
                  <ChangeUsersStatusModal
                    open={reactivateUserModalIsOpen}
                    onClose={toggleReactivateModal}
                    users={users}
                    isRemoving={false}
                  />
                </>
              )
              : (
                <>
                  <FormActionButton
                    tooltipText="Masquerade as the user"
                    onClick={handleMasqueradeClick}
                  >
                    Masquerade
                  </FormActionButton>
                  <FormActionButton
                    tooltipText="Deactivate the user"
                    actionType="danger"
                    onClick={toggleDeactivateModal}
                  >
                    Deactivate
                  </FormActionButton>
                  <ChangeUsersStatusModal
                    open={deactivateUserModalIsOpen}
                    onClose={toggleDeactivateModal}
                    users={users}
                    isRemoving={true}
                  />
                </>
              )}
          </div>
        </div>
      )}
    >
      <TabNavigation
        basePath={`/a/admin/users/${userId}`}
        tabs={TABS}
        defaultPath={'basic'}
      >
        {children}
      </TabNavigation>
    </SingleItemLayoutWithAside>
  )
})

export default ClientLayout
