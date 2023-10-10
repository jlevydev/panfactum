import React, { useState } from 'react'
import { useLogin } from 'react-admin'
import { useParams } from 'react-router-dom'

import AllUserAudit from '@/app/app/allUsers/pages/AllUserAudit'
import AllUserAuth from '@/app/app/allUsers/pages/AllUserAuth'
import AllUserBasic from '@/app/app/allUsers/pages/AllUserBasic'
import AllUserOrgs from '@/app/app/allUsers/pages/AllUserOrgs'
import AllUserSubs from '@/app/app/allUsers/pages/AllUserSubs'
import FormActionButton from '@/components/form/FormActionButton'
import SingleItemLayout from '@/components/layout/SingleItemLayout'
import TabNavigation from '@/components/layout/TabNavigation'
import ChangeUsersStatusModal from '@/components/modals/ChangeUsersStatusModal'
import { useGetOneUser } from '@/lib/hooks/queries/useGetOneUser'

function AllUserEditRendered ({ userId }: {userId: string}) {
  const { data } = useGetOneUser(userId)
  const [reactivateUserModalIsOpen, setReactivateUserModalIsOpen] = useState<boolean>(false)
  const [deactivateUserModalIsOpen, setDeactivateUserModalIsOpen] = useState<boolean>(false)
  const login = useLogin()

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { firstName, lastName, id } = data

  return (
    <SingleItemLayout
      title={`${firstName} ${lastName}`}
      id={id}
      asideStateKey="all-user-edit-aside"
      aside={(
        <div className="flex flex-col">
          <h3>User Actions</h3>
          <div className="flex flex-row flex-wrap gap-x-4">

            {data.isDeleted
              ? (
                <>
                  <FormActionButton
                    tooltipText="Reactivate the user"
                    actionType="danger"
                    onClick={() => setReactivateUserModalIsOpen(true)}
                  >
                    Reactivate
                  </FormActionButton>
                  <ChangeUsersStatusModal
                    open={reactivateUserModalIsOpen}
                    onClose={() => setReactivateUserModalIsOpen(false)}
                    onSuccess={() => {}}
                    users={[data]}
                    isRemoving={false}
                  />
                </>
              )
              : (
                <>
                  <FormActionButton
                    tooltipText="Masquerade as the user"
                    onClick={() => {
                      login({ loginMethod: 'masquerade', targetUserId: data.id }, '/')
                        .catch(console.error)
                    }}
                  >
                    Masquerade
                  </FormActionButton>
                  <FormActionButton
                    tooltipText="Deactivate the user"
                    actionType="danger"
                    onClick={() => setDeactivateUserModalIsOpen(true)}
                  >
                    Deactivate
                  </FormActionButton>
                  <ChangeUsersStatusModal
                    open={deactivateUserModalIsOpen}
                    onClose={() => setDeactivateUserModalIsOpen(false)}
                    onSuccess={() => {}}
                    users={[data]}
                    isRemoving={true}
                  />
                </>
              )}
          </div>
        </div>
      )}
    >
      <TabNavigation
        defaultPath={'basic'}
        tabs={[
          {
            label: 'Basic',
            path: 'basic',
            element: <AllUserBasic userId={userId}/>
          },
          {
            label: 'Auth',
            path: 'auth',
            element: <AllUserAuth userId={userId}/>
          },
          {
            label: 'Organizations',
            path: 'orgs',
            element: <AllUserOrgs userId={userId}/>
          },
          {
            label: 'Subscriptions',
            path: 'subs',
            element: <AllUserSubs userId={userId}/>
          },
          {
            label: 'Audit',
            path: 'audit',
            element: <AllUserAudit userId={userId}/>
          }
        ]}
      />
    </SingleItemLayout>
  )
}

export default function AllUserEdit () {
  const { userId } = useParams()
  if (!userId) {
    return null
  }
  return <AllUserEditRendered userId={userId}/>
}
