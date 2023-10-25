'use client'

import { memo } from 'react'

import RoleCreate from '@/components/commonPages/roles/RoleCreate'

interface PageProps {
  params: {orgId: string}
}
export default memo(function Page ({ params: { orgId } }: PageProps) {
  return (
    <RoleCreate
      organizationId={orgId}
      redirectTo={`/a/admin/orgs/${orgId}/members/roles`}
    />
  )
})
