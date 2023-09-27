import {
  BooleanInput, Datagrid, FilterButton,
  FunctionField, InfiniteList,
  TextField, useRecordContext
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import Button, { ButtonProps } from '@mui/material/Button'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'
import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import ChangeUserRoleModal from '@/components/modals/ChangeUserRoleModal'
import type { AllOrganizationMembershipsResultType } from '@panfactum/primary-api'

const Filters = [
  <BooleanInput
    label="Is Active"
    source="isActive"
    key="isActive"
    defaultValue={true}
  />
]

function UserListActions () {
  return (
    <div className="flex justify-right">
      <FilterButton
        filters={Filters}
        className="flex-grow"
      />
    </div>
  )
}
/*******************************************
 * Expand Panel
 * *****************************************/
function PanelButton (props: ButtonProps) {
  return (
    <Button
      variant="contained"
      size="small"
      {...props}
      className={`py-1 px-2 text-xs normal-case bg-primary ${props.className ?? ''}`}
    />
  )
}
function Panel () {
  const membershipRecord = useRecordContext<AllOrganizationMembershipsResultType>()
  const basePath = useAdminBasePath()
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const onChangeRoleClick = () => setIsRoleModalOpen(true)
  const onRoleModalClose = () => setIsRoleModalOpen(false)

  return (
    <div className="flex flex-wrap gap-4 py-2">
      <Link to={`${basePath}/allOrgs/${membershipRecord.organizationId}`}>
        <PanelButton>
          View Organization
        </PanelButton>
      </Link>
      <PanelButton onClick={onChangeRoleClick}>
        Change Role
      </PanelButton>
      <PanelButton className="bg-red">
        Leave
      </PanelButton>
      <ChangeUserRoleModal
        open={isRoleModalOpen}
        onClose={onRoleModalClose}
        orgId={membershipRecord.organizationId}
        membershipId={membershipRecord.id}
        currentRoleId={membershipRecord.roleId}
      />
    </div>
  )
}

/*******************************************
 * Main List
 * *****************************************/

interface IAllUserOrgsProps {
  userId: string;
}
export default function AllUserOrgs (props: IAllUserOrgsProps) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allOrgMemberships"
        filter={{ userId: props.userId, isUnitary: false }}
        sort={{ field: 'organizationId', order: 'DESC' }}
        actions={<UserListActions/>}
        empty={<div>No associated organizations</div>}
        perPage={25}
        component={'div'}
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick="expand"
          expand={<Panel/>}
          expandSingle={true}
        >
          <TextField
            source="organizationName"
            label="Name"
          />
          <TextField
            source="roleName"
            label="Role"
          />
          <FunctionField
            source="createdAt"
            label="Joined At"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="deletedAt"
            label="Left At"
            render={(record: {id: string, deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
