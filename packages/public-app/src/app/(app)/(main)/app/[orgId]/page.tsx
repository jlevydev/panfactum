'use client'

// This page is simply meant to redirect the user
// depending on their context
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page () {
  const router = useRouter()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace(`${window.location.pathname}/subscriptions`)
    }, 0)
    return () => clearTimeout(timeoutId)
  })
  return null
}
