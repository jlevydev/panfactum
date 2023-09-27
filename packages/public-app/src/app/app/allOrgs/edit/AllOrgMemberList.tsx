import {
  BooleanInput, Datagrid, EmailField, FilterButton, FilterForm,
  FunctionField, InfiniteList,
  TextField, useRecordContext
} from 'react-admin'
import TimeFromNowField from '@/components/time/TimeFromNowField'
import React, { useState } from 'react'
import { useAdminBasePath } from '@/lib/hooks/navigation/useAdminBasePath'
import ChangeUserRoleModal from '@/components/modals/ChangeUserRoleModal'
import { Link } from 'react-router-dom'
import Button, { ButtonProps } from '@mui/material/Button'
import type { AllOrganizationMembershipsResultType } from '@panfactum/primary-api'

const Filters = [
  <BooleanInput
    label="Is Active"
    source="isActive"
    key="isActive"
    defaultValue={true}
  />
]

function MemberListActions () {
  return (
    <div className="flex justify-between w-full">
      <FilterForm filters={Filters} />
      <div className="flex">
        <FilterButton
          filters={Filters}
          className="flex-grow"
        />
      </div>
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
      <Link to={`${basePath}/allUsers/${membershipRecord.userId}`}>
        <PanelButton>
          View User
        </PanelButton>
      </Link>
      <PanelButton onClick={onChangeRoleClick}>
        Change Role
      </PanelButton>
      <PanelButton className="bg-red">
        Kick
      </PanelButton>
      <ChangeUserRoleModal
        open={isRoleModalOpen}
        onClose={onRoleModalClose}
        orgId={membershipRecord.organizationId}
        currentRoleId={membershipRecord.roleId}
        membershipId={membershipRecord.id}
      />
    </div>
  )
}

/*******************************************
 * List
 * *****************************************/

interface IAllOrgMemberListProps {
  orgId: string;
}
export default function AllOrgMemberList (props: IAllOrgMemberListProps) {
  return (
    <div className="p-4">
      <InfiniteList
        resource="allOrgMemberships"
        filter={{ organizationId: props.orgId }}
        sort={{ field: 'userLastName', order: 'DESC' }}
        actions={<MemberListActions/>}
        empty={<div>No members in this organization</div>}
        component={'div'}
        perPage={25}
      >
        <Datagrid
          rowClick="expand"
          expand={<Panel/>}
          expandSingle={true}
        >
          <TextField
            source="userFirstName"
            label="First Name"
          />
          <TextField
            source="userLastName"
            label="Last Name"
          />
          <EmailField
            source="userEmail"
            label="Email"
          />
          <TextField
            source="roleName"
            label="Role"
          />
          <FunctionField
            source="createdAt"
            label="Joined"
            render={(record: {createdAt: number}) => <TimeFromNowField unixSeconds={record.createdAt}/>}
          />
          <FunctionField
            source="deletedAt"
            label="Left"
            render={(record: {id: string, deletedAt: number | null}) => <TimeFromNowField unixSeconds={record.deletedAt}/>}
          />
        </Datagrid>
      </InfiniteList>
    </div>

  )
}
