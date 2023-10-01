'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Parses the current pathname to extract the org id and trailing path parts from the /app directory
const regex = /\/app\/?(?<orgId>[a-zA-Z0-9-]*)(?<pathParts>.*)/
function parsePath (path: string) {
  const found = path.match(regex)
  if (found) {
    return found.groups as {orgId: string, pathParts: string}
  } else {
    return null
  }
}

export function useActiveOrganizationId () {
  const [activeOrganizationId, _setActiveOrganizationId] = useState<string | null>(null)
  const router = useRouter()

  // Anytime we change the active organization id, we want to change the url
  // to reflect that
  const setActiveOrganizationId = (id: string) => {
    if (window !== undefined) {
      const parsed = parsePath(window.location.pathname)
      if (parsed) {
        const { pathParts, orgId } = parsed
        if (orgId !== id) {
          const newPath = `/app/${id}${pathParts}`
          // If there was a previous org id, we are switching orgs, so we want to preserve
          // the ability to go back; otherwise, we don't want to allow the users to go back
          if (orgId !== '') {
            router.push(newPath)
          } else {
            router.replace(newPath)
          }
        }
      }
    }

    _setActiveOrganizationId(id)
  }

  return { activeOrganizationId, setActiveOrganizationId }
}
