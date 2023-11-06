'use client'

import type { ReactNode } from 'react'
import React, { memo, useCallback, useMemo, useState } from 'react'

import FormActionButton from '@/components/form/FormActionButton'
import SingleItemLayoutWithAside from '@/components/layout/app/secondary/SingleItemLayoutWithAside'
import TabNavigation from '@/components/layout/app/tabs/AppTabNavigation'
import ChangeOrgsStatusModal from '@/components/modals/ChangeOrgsStatusModal'
import { useGetOneOrganization } from '@/lib/hooks/queries/crud/organizations'

const TABS = [
  {
    label: 'Basic',
    path: 'basic' as const
  },
  {
    label: 'Members',
    path: 'members' as const
  },
  {
    label: 'Packages',
    path: 'packages' as const
  }
]

interface LayoutProps {
  children: ReactNode,
  orgId: string
}

const ClientLayout = memo(({ children, orgId }: LayoutProps) => {
  const { data: org } = useGetOneOrganization(orgId)
  const [reactivateOrgModalIsOpen, setReactivateOrgModalIsOpen] = useState<boolean>(false)
  const [deactivateOrgModalIsOpen, setDeactivateOrgModalIsOpen] = useState<boolean>(false)

  const toggleReactivateModal = useCallback(() => {
    setReactivateOrgModalIsOpen((prev) => !prev)
  }, [setReactivateOrgModalIsOpen])
  const toggleDeactivateModal = useCallback(() => {
    setDeactivateOrgModalIsOpen((prev) => !prev)
  }, [setDeactivateOrgModalIsOpen])
  const orgs = useMemo(() => (org ? [org] : []), [org])

  if (!org) {
    return null
  }

  const { id, name, isDeleted } = org

  return (
    <SingleItemLayoutWithAside
      title={name}
      id={id}
      asideStateKey="all-org-edit-aside"
      aside={(
        <div className="flex flex-col">
          <h3>Org Actions</h3>
          <div className="flex flex-row flex-wrap gap-x-4">
            {isDeleted
              ? (
                <>
                  <FormActionButton
                    tooltipText="Reactivate the organization"
                    actionType="danger"
                    onClick={toggleReactivateModal}
                  >
                    Reactivate
                  </FormActionButton>
                  <ChangeOrgsStatusModal
                    open={reactivateOrgModalIsOpen}
                    onClose={toggleReactivateModal}
                    organizations={orgs}
                    isRemoving={false}
                  />
                </>
              )
              : (
                <>
                  <FormActionButton
                    tooltipText="Deactivate the organization"
                    actionType="danger"
                    onClick={toggleDeactivateModal}
                  >
                    Deactivate
                  </FormActionButton>
                  <ChangeOrgsStatusModal
                    open={deactivateOrgModalIsOpen}
                    onClose={toggleDeactivateModal}
                    organizations={orgs}
                    isRemoving={true}
                  />
                </>
              )}
          </div>
        </div>
      )}
    >
      <TabNavigation
        basePath={`/a/admin/orgs/${orgId}`}
        tabs={TABS}
        defaultPath={'basic'}
      >
        {children}
      </TabNavigation>
    </SingleItemLayoutWithAside>
  )
})

export default ClientLayout
