import type { UserResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  Edit,
  required,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar, useEditContext, useLogin
} from 'react-admin'

import FormActionButton from '@/components/form/FormActionButton'
import FormSection from '@/components/form/FormSection'
import ChangeUsersStatusModal from '@/components/modals/ChangeUsersStatusModal'

/************************************************
 * Form
 * **********************************************/

function MyToolbar () {
  return (
    <Toolbar className="flex justify-between">
      <SaveButton label="Save" />
    </Toolbar>
  )
}

function AllUserBasicForm () {
  const login = useLogin()
  const { record } = useEditContext<UserResultType>()
  const [reactivateUserModalIsOpen, setReactivateUserModalIsOpen] = useState<boolean>(false)
  const [deactivateUserModalIsOpen, setDeactivateUserModalIsOpen] = useState<boolean>(false)

  if (record === undefined) {
    return null
  }

  return (
    <SimpleForm toolbar={<MyToolbar/>}>
      <div className="flex flex-col gap-4">

        <FormSection title="Actions">
          <div className="flex flex-row flex-wrap gap-4">
            {record.isDeleted
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
                    users={[record]}
                    isRemoving={false}
                  />
                </>
              )
              : (
                <>
                  <FormActionButton
                    tooltipText="Masquerade as the user"
                    onClick={() => {
                      login({ loginMethod: 'masquerade', targetUserId: record.id }, '/')
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
                    users={[record]}
                    isRemoving={true}
                  />
                </>
              )}

          </div>
        </FormSection>
        <FormSection title="Basic Info">
          <div className="flex md:gap-12 flex-wrap">
            <TextInput
              className="w-full md:w-72"
              variant="outlined"
              label="First Name"
              source="firstName"
              validate={required()}
            />
            <TextInput
              className="w-full md:w-72"
              variant="outlined"
              label="Last Name"
              source="lastName"
              validate={required()}
            />
          </div>
        </FormSection>
      </div>
    </SimpleForm>
  )
}

/************************************************
 * Root
 * **********************************************/

interface IAllUserBasicProps{
  userId: string;
}
export default function AllUserBasic (props: IAllUserBasicProps) {
  return (
    <Edit
      resource="users"
      id={props.userId}
      component="div"
    >
      <AllUserBasicForm/>
    </Edit>
  )
}
