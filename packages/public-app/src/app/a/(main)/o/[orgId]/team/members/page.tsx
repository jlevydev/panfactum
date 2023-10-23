'use client'

import { memo } from 'react'

import OrgMemberList from '@/components/commonPages/orgs/OrgMemberList'

interface PageProps {
  params: {orgId: string}
}
export default memo(function Page ({ params: { orgId } }: PageProps) {
  return (
    <OrgMemberList
      orgId={orgId}
      isAdminView={false}
    />
  )
})
