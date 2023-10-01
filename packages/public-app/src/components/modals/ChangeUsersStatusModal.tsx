import ChangeResourceStatusModal from '@/components/modals/ChangeResourceStatusModal'
import { useUpdateManyUser } from '@/lib/hooks/queries/useUpdateManyUser'

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface IReactivateUsersModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  users: User[]
  isRemoving: boolean;
}

export default function ChangeUsersStatusModal (props: IReactivateUsersModalProps) {
  const {
    open,
    onClose,
    onSuccess,
    users,
    isRemoving
  } = props
  const [update] = useUpdateManyUser()
  const warningText = isRemoving
    ? 'By deactivating these users, they will be removed from all organizations and their logins will be disabled.'
    : 'By reactivating these users, they will receive a notification and be able to login to their accounts again.'
  return (
    <ChangeResourceStatusModal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      records={users}
      isRemoving={isRemoving}
      update={update}
      resourceName="Users"
      warningText={warningText}
      renderRecord={({ firstName, lastName }) => `${firstName} ${lastName}`}
      type="delete"
    />
  )
}
