import React, { ChangeEvent, useState } from 'react'
import WarningIcon from '@mui/icons-material/Warning'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

interface IConfirmFormProps {
  warningText: string;
  confirmationText: string;
  onConfirm: () => void
}

export default function ConfirmForm (props: IConfirmFormProps) {
  const [confirmValue, setConfirmValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const { confirmationText, onConfirm, warningText } = props
  const isConfirmValueCorrect = confirmValue === confirmationText
  return (
    <div className="flex flex-col gap-4">
      <div
        className="h-0.5 bg-secondary"
      />
      <div className="flex flex-row gap-4 items-center">
        <WarningIcon/>
        <div className="font-bold text-sm">
          {warningText}
        </div>
      </div>
      <div/>
      <TextField
        error={error !== null}
        label={`Type "${confirmationText}" to confirm`}
        value={confirmValue}
        variant="outlined"
        placeholder={confirmationText}
        InputLabelProps={{
          shrink: true
        }}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setConfirmValue(event.target.value)
        }}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            if (isConfirmValueCorrect) {
              setError(null)
              onConfirm()
            } else {
              setError('Incorrect confirmation value entered')
            }
          }
        }}
      />
      <Button
        disabled={!isConfirmValueCorrect}
        className={`${isConfirmValueCorrect ? 'bg-primary' : 'bg-base-300'}`}
        variant="contained"
        onClick={() => {
          if (isConfirmValueCorrect) {
            onConfirm()
          }
        }}
      >
        Confirm
      </Button>
    </div>
  )
}
