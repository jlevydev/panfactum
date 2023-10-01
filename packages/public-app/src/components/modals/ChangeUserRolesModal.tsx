import React, { useState } from 'react'
import { BooleanField, Datagrid, List, TextField } from 'react-admin'

import BaseModal from '@/components/modals/BaseModal'
import type { APIServerError } from '@/lib/clients/api/apiFetch'
import { useUpdateManyOrganizationMemberships } from '@/lib/hooks/queries/useUpdateManyOrganizationMemberships'

interface Membership {
  id: string;
  organizationName: string;
  userFirstName: string;
  userLastName: string;
}

interface IProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  orgId: string;
  memberships: Membership[];
  currentRoleId?: string;
  perspective: 'user' | 'organization'
}
export default function ChangeUserRolesModal (props: IProps) {
  const [updateMemberships] = useUpdateManyOrganizationMemberships()
  const [error, setError] = useState<null | APIServerError>(null)
  const {
    open,
    onClose,
    orgId,
    memberships,
    currentRoleId,
    perspective,
    onSuccess
  } = props

  const postRowSx = (record: {id: string}) => {
    return record.id === currentRoleId
      ? {
        backgroundColor: '#d3d3d3 !important'
      }
      : {}
  }

  const errors = (error?.errors || [])
    .map(({ message, resourceId }) => {
      const membership = memberships.find(record => record.id === resourceId)
      const prefix = membership === undefined
        ? 'Unknown resource'
        : (perspective === 'user' ? membership.organizationName : `${membership.userFirstName} ${membership.userLastName}`)
      return `${prefix}: Unable to change role. ${message}`
    })

  return (
    <BaseModal
      open={open}
      onClose={() => {
        onClose()
        setError(null)
      }}
      name="change-role"
      title="Change Role"
      description="Select a role from the list below"
      errors={errors}
    >
      <List
        resource="organizationRoles"
        filter={{ organizationId: orgId }}
        sort={{ field: 'isCustom', order: 'DESC' }}
        actions={<div/>}
        disableSyncWithLocation={true}
        storeKey={'allUserOrgsChangeRole'}
      >
        <Datagrid
          bulkActionButtons={false}
          rowSx={postRowSx}
          rowClick={async (_, __, roleRecord):Promise<false> => {
            if (roleRecord.id !== currentRoleId) {
              await updateMemberships(
                memberships.map(({ id }) => id),
                {
                  roleId: roleRecord.id as string
                }, {
                  onSuccess: () => {
                    setError(null)
                    onClose()
                    if (onSuccess) {
                      onSuccess()
                    }
                  },
                  onError: (error) => {
                    setError(error)
                  }
                })
            }
            return false
          }}
        >
          <TextField
            source="name"
            label="Role"
          />
          <BooleanField
            source="isCustom"
            label="Custom"
          />
          <TextField
            source="description"
            label="Description"
          />
        </Datagrid>
      </List>
    </BaseModal>
  )
}
