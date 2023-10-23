'use client'

import { memo } from 'react'

import RoleEdit from '@/components/commonPages/roles/RoleEdit'

interface PageProps {
  params: {roleId: string}
}
export default memo(function Page ({ params: { roleId } }: PageProps) {
  return (
    <RoleEdit roleId={roleId}/>
  )
})
