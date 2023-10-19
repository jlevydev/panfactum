import React from 'react'
import { useParams } from 'react-router-dom'

import RoleEdit from '@/app/app/commonPages/roles/RoleEdit'

export default function AllOrgRoleEdit () {
  const { roleId } = useParams()
  if (!roleId) {
    return null
  }
  return <RoleEdit roleId={roleId}/>
}
