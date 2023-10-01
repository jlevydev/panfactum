import { useState } from 'react'
import type { RaRecord } from 'react-admin'

import BaseModal from '@/components/modals/BaseModal'
import ConfirmForm from '@/components/modals/ConfirmForm'
import type { APIServerError } from '@/lib/clients/api/apiFetch'

interface IBaseProps<T extends RaRecord<string>> {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  records: T[],
  isRemoving: boolean,
  warningText: string;
  renderRecord: (record: T) => string
  resourceName: string;
}

interface IArchiveProps{
  type: 'archive',
  update: (id: string[], delta: {isArchived: boolean}, options: {onSuccess?: () => void, onError?: (error: APIServerError) => void}) => void,
}

interface IDeleteProps {
  type: 'delete',
  update: (id: string[], delta: {isDeleted: boolean}, options: {onSuccess?: () => void, onError?: (error: APIServerError) => void}) => void,
}

export default function ChangeResourceStatusModal<T extends RaRecord<string>> (props: (IBaseProps<T> & (IArchiveProps | IDeleteProps))) {
  const [error, setError] = useState<null | APIServerError>(null)
  const {
    open,
    onClose,
    records,
    onSuccess,
    isRemoving,
    renderRecord,
    warningText,
    update,
    type,
    resourceName
  } = props

  const action = type === 'delete'
    ? (isRemoving ? 'Deactivate' : 'Reactivate')
    : (isRemoving ? 'Archive' : 'Restore')

  const title = `${action} ${resourceName}`
  const description = `${action} the following ${resourceName.toLowerCase()}`

  const onConfirm = () => {
    const ids = records.map(({ id }) => id)
    const options = {
      onSuccess: () => {
        setError(null)
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      },
      onError: (error: APIServerError) => {
        setError(error)
      }
    }
    if (type === 'delete') {
      void update(ids, { isDeleted: isRemoving }, options)
    } else {
      void update(ids, { isArchived: isRemoving }, options)
    }
  }
  const errors = (error?.errors || [])
    .map(({ message, resourceId }) => {
      const record = records.find(record => record.id === resourceId)
      const prefix = record === undefined ? 'Unknown resource' : renderRecord(record)
      return `${prefix}: Unable to ${isRemoving ? 'deactivate' : 'reactivate'}. ${message}`
    })

  return (
    <BaseModal
      open={open}
      onClose={() => {
        onClose()
      }}
      name={title.replace(' ', '-').toLowerCase()}
      title={title}
      description={description}
      errors={errors}
    >
      <div>
        <div className="flex flex-row flex-wrap gap-4 py-4">
          {records.map(record => {
            const name = renderRecord(record)
            return (
              <div key={name}>
                {name}
              </div>
            )
          })}
        </div>
        <ConfirmForm
          warningText={warningText}
          onConfirm={onConfirm}
          confirmationText={action}
        />
      </div>
    </BaseModal>
  )
}
