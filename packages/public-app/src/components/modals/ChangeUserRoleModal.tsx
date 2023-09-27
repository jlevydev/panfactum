import { BooleanField, Datagrid, List, TextField } from 'react-admin'
import React, { useState } from 'react'
import { useUpdateAllOrganizationMembership } from '@/lib/hooks/queries/useUpdateAllOrganizationMembership'
import BaseModal from '@/components/modals/BaseModal'

interface IChangeUserRoleModalProps {
  open: boolean
  onClose: () => void
  orgId: string;
  membershipId: string;
  currentRoleId: string;
}
export default function ChangeUserRoleModal (props: IChangeUserRoleModalProps) {
  const [updateMembership] = useUpdateAllOrganizationMembership()
  const [error, setError] = useState<null | string>(null)
  const {
    open,
    onClose,
    orgId,
    membershipId,
    currentRoleId
  } = props

  const postRowSx = (record: {id: string}) => {
    return record.id === currentRoleId
      ? {
        backgroundColor: '#d3d3d3 !important'
      }
      : {}
  }

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
      errors={error ? [`Unable to update. ${error}`] : []}
    >
      <List
        resource="allOrgRoles"
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
              await updateMembership({
                id: membershipId,
                roleId: roleRecord.id as string
              }, {
                onSuccess: () => {
                  setError(null)
                  onClose()
                },
                onError: ({ message }) => {
                  setError(message)
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
        </Datagrid>
      </List>
    </BaseModal>
  )
}
