'use client'

import { memo } from 'react'

import OrgRoleList from '@/components/commonPages/roles/OrgRoleList'

interface PageProps {
  params: {orgId: string}
}
export default memo(function Page ({ params: { orgId } }: PageProps) {
  return (
    <OrgRoleList
      orgId={orgId}
      isAdminView={false}
    />
  )
})
