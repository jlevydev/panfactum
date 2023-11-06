'use client'

import { memo } from 'react'

import RoleEdit from '@/components/commonPages/roles/RoleEdit'
import SingleItemLayoutWithAside from '@/components/layout/app/secondary/SingleItemLayoutWithAside'
import { useGetOneOrganizationRole } from '@/lib/hooks/queries/crud/organizationRoles'

interface PageProps {
  params: {roleId: string}
}
export default memo(function Page ({ params: { roleId } }: PageProps) {
  const { data } = useGetOneOrganizationRole(roleId)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { id, name } = data

  return (
    <SingleItemLayoutWithAside
      title={name}
      id={id}
      asideStateKey="team-role-edit-aside"
      aside=<div/>
    >
      <RoleEdit roleId={roleId}/>
    </SingleItemLayoutWithAside>
  )
})
