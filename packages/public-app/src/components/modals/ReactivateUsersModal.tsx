import { useState } from 'react'
import BaseModal from '@/components/modals/BaseModal'
import ConfirmForm from '@/components/modals/ConfirmForm'
import { useUpdateManyUser } from '@/lib/hooks/queries/useUpdateManyUser'
import type { UpdateManyError } from '@/lib/providers/data/dataProvider'

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
}
export default function ReactivateUsersModal (props: IReactivateUsersModalProps) {
  const [update] = useUpdateManyUser()
  const [error, setError] = useState<null | UpdateManyError>(null)
  const {
    open,
    onClose,
    users,
    onSuccess
  } = props

  const onConfirm = () => {
    void update(
      users.map(({ id }) => id),
      {
        isDeleted: false
      },
      {
        onSuccess: () => {
          setError(null)
          if (onSuccess) {
            onSuccess()
          }
          onClose()
        },
        onError: (error) => {
          setError(error)
        }
      }
    )
  }

  const errors = Object
    .entries((error?.errorMap || {}))
    .map(([id, message]) => {
      const user = users.find(user => user.id === id)
      const prefix = user === undefined ? 'Unknown user' : `${user.firstName} ${user.lastName}`
      return `${prefix}: Unable to reactivate. ${message}`
    })

  return (
    <BaseModal
      open={open}
      onClose={() => {
        onClose()
      }}
      name="reactivate-users"
      title="Reactivate Users"
      description="Reactivate the following users"
      errors={errors}
    >
      <div className="flex flex-row flex-wrap gap-4 pt-4">
        {users.map(({ id, firstName, lastName }) => (
          <div key={id}>
            {firstName}
            {' '}
            {lastName}
          </div>
        ))}
        <ConfirmForm
          warningText="By reactivating these users, they will receive a notification and be able to login to their accounts again."
          onConfirm={onConfirm}
          confirmationText="Reactivate"
        />
      </div>
    </BaseModal>
  )
}
