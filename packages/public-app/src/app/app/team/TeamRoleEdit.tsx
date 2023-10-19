import React from 'react'
import { useParams } from 'react-router-dom'

import RoleEdit from '@/app/app/commonPages/roles/RoleEdit'
import SingleItemLayout from '@/components/layout/SingleItemLayout'
import { useGetOneOrganizationRole } from '@/lib/hooks/queries/useGetOneOrganizationRole'

function TeamRoleEditRendered ({ roleId }: {roleId: string}) {
  const { data } = useGetOneOrganizationRole(roleId)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { id, name } = data

  return (
    <SingleItemLayout
      title={name}
      id={id}
      asideStateKey="team-role-edit-aside"
      aside=<div/>
    >
      <RoleEdit roleId={roleId}/>
    </SingleItemLayout>
  )
}

export default function TeamRoleEdit () {
  const { roleId } = useParams()
  if (!roleId) {
    return null
  }
  return <TeamRoleEditRendered roleId={roleId}/>
}
