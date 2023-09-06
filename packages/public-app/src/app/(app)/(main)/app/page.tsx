'use client'

import { useUserOrganizations } from '../../../../lib/hooks/useUserOrganizations'
import { useContext, useEffect } from 'react'
import { ActiveOrganizationContext } from '../../../../lib/contexts/ActiveOrganizationContext'

export default function Page () {
  const { activeOrganizationId, setActiveOrganizationId } = useContext(ActiveOrganizationContext)
  const { isLoading: isLoadingUserOrganizations, data } = useUserOrganizations()

  useEffect(() => {
    if (!isLoadingUserOrganizations && data && activeOrganizationId === null) {
      const personalOrg = data.find(org => org.isUnitary)
      if (personalOrg === undefined) {
        throw new Error('User does not have a personal organization')
      }
      setActiveOrganizationId(personalOrg.id)
    }
  }, [isLoadingUserOrganizations, activeOrganizationId, data, setActiveOrganizationId])

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      {isLoadingUserOrganizations ? 'Loading...' : null}
    </div>
  )
}
