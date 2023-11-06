import WarningIcon from '@mui/icons-material/Warning'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import type { ChangeEvent, KeyboardEvent } from 'react'
import React, { memo, useCallback, useState } from 'react'

const InputLabelProps = {
  shrink: true
}

interface IConfirmFormProps {
  warningText: string;
  confirmationText: string;
  onConfirm: () => void
}

export default memo(function ConfirmForm (props: IConfirmFormProps) {
  const [confirmValue, setConfirmValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const { confirmationText, onConfirm, warningText } = props
  const isConfirmValueCorrect = confirmValue === confirmationText

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setConfirmValue(event.target.value)
  }, [setConfirmValue])

  const handleKeyUp = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (isConfirmValueCorrect) {
        setError(null)
        onConfirm()
      } else {
        setError('Incorrect confirmation value entered')
      }
    }
  }, [isConfirmValueCorrect, setError, onConfirm])

  const handleClick = useCallback(() => {
    if (isConfirmValueCorrect) {
      onConfirm()
    }
  }, [isConfirmValueCorrect, onConfirm])

  return (
    <div className="flex flex-col gap-4">
      <div
        className="h-0.5 bg-secondary"
      />
      <div className="flex flex-row gap-4 items-center">
        <WarningIcon/>
        <div className="font-bold text-sm lg:text-base">
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
        InputLabelProps={InputLabelProps}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
      />
      <Button
        disabled={!isConfirmValueCorrect}
        className={`${isConfirmValueCorrect ? 'bg-primary' : 'bg-gray-dark'}`}
        variant="contained"
        onClick={handleClick}
      >
        Confirm
      </Button>
    </div>
  )
})
