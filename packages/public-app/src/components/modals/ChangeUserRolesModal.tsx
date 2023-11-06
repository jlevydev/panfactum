import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import React, { useState } from 'react'

import CheckboxField from '@/components/fields/boolean/CheckboxField'
import TextField from '@/components/fields/text/TextField'
import BaseModalLazy from '@/components/modals/BaseModalLazy'
import type { APIServerError } from '@/lib/clients/api/apiFetch'
import { useUpdateManyOrganizationMembership } from '@/lib/hooks/queries/crud/organizationMemberships'
import { useGetListOrganizationRole } from '@/lib/hooks/queries/crud/organizationRoles'

interface Membership {
  id: string;
  organizationName: string;
  userFirstName: string;
  userLastName: string;
}

interface IProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  orgId: string;
  memberships: Membership[];
  currentRoleId?: string;
  perspective: 'user' | 'organization'
}
export default function ChangeUserRolesModal (props: IProps) {
  const {
    open,
    onClose,
    orgId,
    memberships,
    currentRoleId,
    perspective,
    onSuccess
  } = props

  const { mutate } = useUpdateManyOrganizationMembership()
  const { data } = useGetListOrganizationRole({
    filters: [{ field: 'organizationId', operator: 'strEq', value: orgId }],
    sort: { field: 'isCustom', order: 'DESC' }
  })

  const rows = data?.pages.map(page => page.data).flat(1) ?? []
  const [error, setError] = useState<null | APIServerError>(null)

  const errors = (error?.errors || [])
    .map(({ message, resourceId }) => {
      const membership = memberships.find(record => record.id === resourceId)
      const prefix = membership === undefined
        ? 'Unknown resource'
        : (perspective === 'user' ? membership.organizationName : `${membership.userFirstName} ${membership.userLastName}`)
      return `${prefix}: Unable to change role. ${message}`
    })

  return (
    <BaseModalLazy
      open={open}
      onClose={() => {
        onClose()
        setError(null)
      }}
      name="change-role"
      title="Change Role"
      description="Select a role from the list below"
      errors={errors}
    >
      <TableContainer component={Paper}>
        <Table aria-label="roles">
          <TableHead>
            <TableRow>
              <TableCell
                align="left"
                className="w-24"
              >
                Name
              </TableCell>
              <TableCell
                align="left"
                className="md:w-32"
              >
                Is Custom
              </TableCell>
              <TableCell align="left">Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ id: roleId, name, description, isCustom }) => (
              <TableRow
                key={roleId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                className="hover:bg-gray-light cursor-pointer"
                onClick={() => {
                  if (roleId !== currentRoleId) {
                    mutate({
                      ids: memberships.map(({ id }) => id),
                      delta: {
                        roleId
                      }
                    },
                    {
                      onSuccess: () => {
                        setError(null)
                        onClose()
                        if (onSuccess) {
                          onSuccess()
                        }
                      },
                      onError: (error) => {
                        setError(error)
                      }
                    })
                  }
                  return false
                }}
              >
                <TableCell
                  component="th"
                  id={roleId}
                  scope="row"
                  padding="none"
                  align="left"
                >
                  <TextField value={name}/>
                </TableCell>
                <TableCell align="left">
                  <CheckboxField value={isCustom}/>
                </TableCell>
                <TableCell align="left">
                  <TextField value={description}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </BaseModalLazy>
  )
}
