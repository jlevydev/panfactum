import type { OrganizationRolesCreateBodyElementType } from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useMemo } from 'react'

import RoleEditBase from '@/components/commonPages/roles/RoleEditBase'
import type { BasicFormUpdateFn } from '@/components/form/BasicForm'
import {
  useCreateOneOrganizationRole
} from '@/lib/hooks/queries/crud/organizationRoles'

/************************************************
 * Root
 * **********************************************/

interface IRoleCreateProps{
  organizationId: string;
  redirectTo: string;
}

export default memo(function RoleCreate (props: IRoleCreateProps) {
  const { organizationId, redirectTo } = props
  const { mutateAsync } = useCreateOneOrganizationRole()
  const update: BasicFormUpdateFn<OrganizationRolesCreateBodyElementType> = useCallback(async (data) => {
    await mutateAsync({
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      organizationId
    })
  }, [mutateAsync, organizationId])
  const router = useRouter()

  const defaultData = useMemo(() => ({
    name: '',
    description: '',
    permissions: [],
    organizationId
  }), [organizationId])

  const handleSuccess = useCallback(() => {
    router.push(redirectTo)
  }, [redirectTo, router])

  return (
    <RoleEditBase
      onSuccess={handleSuccess}
      successMessage={'Role was created successfully!'}
      data={defaultData}
      update={update}
      mode={'create'}
      isGlobalRole={false}
      successMessageMode={'snackbar'}
    />
  )
})
