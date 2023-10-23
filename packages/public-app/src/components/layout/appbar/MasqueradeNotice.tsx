import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'
import React, { memo, useCallback } from 'react'

import { useIdentity } from '@/lib/hooks/queries/auth/useIdentity'
import { useLogin } from '@/lib/hooks/queries/auth/useLogin'

export default memo(function MasqueradeNotice () {
  const { data: identity } = useIdentity()
  const { mutate: login } = useLogin()
  const router = useRouter()

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void login({ loginMethod: 'undo-masquerade' }, {
      onSuccess: () => {
        router.push('/a/admin')
      }
    })
  }, [login, router])

  if (!identity || !identity.masqueradingUserId) {
    return null
  }

  const { firstName, lastName, email } = identity

  return (
    <Tooltip
      title={`You are masquerading as ${firstName} ${lastName} (${email}). Click to undo.`}
    >
      <Button
        className="font-bold bg-white text-primary min-w-0 min-h-0 px-0.5 py-0.5"
        variant="contained"
        onClick={handleClick}
      >
        <SupervisedUserCircleIcon/>
      </Button>
    </Tooltip>
  )
})
