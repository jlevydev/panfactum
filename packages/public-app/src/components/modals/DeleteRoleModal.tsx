import { memo } from 'react'

import DeleteResourceModal from '@/components/modals/DeleteResourceModal'
import { useDeleteManyOrganizationRole } from '@/lib/hooks/queries/crud/organizationRoles'

interface Role {
  id: string;
  name: string;
}

interface IProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  roles: Role[]
}

const renderRecord = ({ name }: Role) => name
export default memo(function DeleteRoleModal (props: IProps) {
  const {
    open,
    onClose,
    onSuccess,
    roles
  } = props
  const { mutate } = useDeleteManyOrganizationRole()
  const warningText = 'Deleting these roles is an unrecoverable operation.'
  return (
    <DeleteResourceModal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      records={roles}
      deleteFn={mutate}
      resourceName="Roles"
      warningText={warningText}
      renderRecord={renderRecord}
    />
  )
})
