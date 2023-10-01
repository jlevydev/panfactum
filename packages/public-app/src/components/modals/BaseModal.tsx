import { Alert } from '@mui/material'
import type { ModalProps } from '@mui/material/Modal'
import Modal from '@mui/material/Modal'

interface IBaseModalProps extends ModalProps{
  name: string;
  title: string;
  description: string;
  errors: string[]
}
export default function BaseModal (props: IBaseModalProps) {
  const { errors, name, title, description, children } = props
  return (
    <Modal
      {...props}
      aria-labelledby={`${name}-modal-title`}
      aria-describedby={`${name}-modal-description`}
      id={`${name}-modal`}
    >
      <div
        className="bg-base-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-3xl p-4 overflow-y-scroll"
        style={{
          maxHeight: '80vh'
        }}
      >
        <h1
          className="text-2xl"
          id={`${name}-modal-title`}
        >
          {title}
        </h1>
        <h2
          id={`${name}-modal-description`}
          className="text-lg"
        >
          {description}
        </h2>
        {children}
        <div className="flex flex-col gap-4 pt-4">
          {errors.map(error => (
            <Alert
              severity="error"
              sx={{ width: '100%' }}
              key={error}
            >
              {error}
            </Alert>
          ))}
        </div>

      </div>
    </Modal>
  )
}
