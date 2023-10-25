import type { OrganizationRolesResultType } from '@panfactum/primary-api'
import { memo, useCallback } from 'react'

import RoleEditBase from '@/components/commonPages/roles/RoleEditBase'
import type { BasicFormUpdateFn } from '@/components/form/BasicForm'
import { useGetOneOrganizationRole, useUpdateOneOrganizationRole } from '@/lib/hooks/queries/crud/organizationRoles'

/************************************************
 * Root
 * **********************************************/

interface IRoleEditProps{
  roleId: string;
}

export default memo(function RoleEdit (props: IRoleEditProps) {
  const { roleId } = props
  const { data } = useGetOneOrganizationRole(roleId)
  const { mutateAsync } = useUpdateOneOrganizationRole()
  const update: BasicFormUpdateFn<OrganizationRolesResultType> = useCallback(async (data) => {
    await mutateAsync({
      id: roleId,
      delta: {
        name: data.name,
        description: data.description,
        permissions: data.permissions
      }
    })
  }, [mutateAsync, roleId])

  const isGlobalRole = data?.organizationId === null

  return (
    <RoleEditBase
      successMessage={'Role was updated successfully'}
      data={data}
      update={update}
      mode={isGlobalRole ? 'show' : 'edit'}
      isGlobalRole={isGlobalRole}
    />
  )
})
