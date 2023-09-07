'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/*
This page is just a stub that powers routing side effects. If a user reaches this page,
we need to redirect them to a _real_ page based on their organization context.
 */
export default function Page () {
  const router = useRouter()
  const path = usePathname()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace(`${path}/subscriptions`)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [router, path])
  return null
}
