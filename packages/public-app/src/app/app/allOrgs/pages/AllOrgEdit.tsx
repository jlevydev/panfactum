import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import AllOrgBasic from '@/app/app/allOrgs/pages/AllOrgBasic'
import AllOrgMembers from '@/app/app/allOrgs/pages/AllOrgMembers'
import AllOrgPackages from '@/app/app/allOrgs/pages/AllOrgPackages'
import FormActionButton from '@/components/form/FormActionButton'
import SingleItemLayout from '@/components/layout/SingleItemLayout'
import TabNavigation from '@/components/layout/TabNavigation'
import ChangeOrgsStatusModal from '@/components/modals/ChangeOrgsStatusModal'
import { useGetOneOrganization } from '@/lib/hooks/queries/useGetOneOrganization'

function AllOrgEditRendered ({ orgId }: {orgId: string}) {
  const { data } = useGetOneOrganization(orgId)
  const [reactivateOrgModalIsOpen, setReactivateOrgModalIsOpen] = useState<boolean>(false)
  const [deactivateOrgModalIsOpen, setDeactivateOrgModalIsOpen] = useState<boolean>(false)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { id, name } = data

  return (
    <SingleItemLayout
      title={name}
      id={id}
      asideStateKey="all-org-edit-aside"
      aside={(
        <div className="flex flex-row flex-wrap gap-4">
          {data.isDeleted
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
                  organizations={[data]}
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
                  organizations={[data]}
                  isRemoving={true}
                />
              </>
            )}
        </div>
      )}
    >
      <TabNavigation
        defaultPath={'basic'}
        tabs={[
          {
            label: 'Basic',
            path: 'basic',
            element: <AllOrgBasic orgId={orgId}/>
          },
          {
            label: 'Members',
            path: 'members',
            element: <AllOrgMembers orgId={orgId}/>
          },
          {
            label: 'Packages',
            path: 'packages',
            element: <AllOrgPackages orgId={orgId}/>
          }
        ]}
      />
    </SingleItemLayout>
  )
}

export default function AllOrgEdit () {
  const { orgId } = useParams()
  if (!orgId) {
    return null
  }
  return <AllOrgEditRendered orgId={orgId}/>
}
