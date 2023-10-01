import type { OrganizationResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  Edit,
  required,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar, useEditContext
} from 'react-admin'

import FormActionButton from '@/components/form/FormActionButton'
import FormSection from '@/components/form/FormSection'
import ChangeOrgsStatusModal from '@/components/modals/ChangeOrgsStatusModal'

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

function AllOrgBasicForm () {
  const { record } = useEditContext<OrganizationResultType>()
  const [reactivateOrgModalIsOpen, setReactivateOrgModalIsOpen] = useState<boolean>(false)
  const [deactivateOrgModalIsOpen, setDeactivateOrgModalIsOpen] = useState<boolean>(false)

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
                    tooltipText="Reactivate the organization"
                    actionType="danger"
                    onClick={() => setReactivateOrgModalIsOpen(true)}
                  >
                    Reactivate
                  </FormActionButton>
                  <ChangeOrgsStatusModal
                    open={reactivateOrgModalIsOpen}
                    onClose={() => setReactivateOrgModalIsOpen(false)}
                    onSuccess={() => {}}
                    organizations={[record]}
                    isRemoving={false}
                  />
                </>
              )
              : (
                <>
                  <FormActionButton
                    tooltipText="Deactivate the organization"
                    actionType="danger"
                    onClick={() => setDeactivateOrgModalIsOpen(true)}
                  >
                    Deactivate
                  </FormActionButton>
                  <ChangeOrgsStatusModal
                    open={deactivateOrgModalIsOpen}
                    onClose={() => setDeactivateOrgModalIsOpen(false)}
                    onSuccess={() => {}}
                    organizations={[record]}
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
              label="Name"
              source="name"
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

interface IAllOrgBasicProps{
  orgId: string;
}
export default function AllOrgBasic (props: IAllOrgBasicProps) {
  return (
    <Edit
      resource="organizations"
      id={props.orgId}
      component="div"
    >
      <AllOrgBasicForm/>
    </Edit>
  )
}
