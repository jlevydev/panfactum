import AddIcon from '@mui/icons-material/Add'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import type { LoginReturnType } from '@panfactum/primary-api'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'
import { memo, useState, useCallback } from 'react'

import DefaultTooltipLazy from '@/components/tooltip/DefaultTooltipLazy'
import { useIdentity } from '@/lib/hooks/queries/auth/useIdentity'
import type { ArrayElement } from '@/lib/util/ArrayElement'

interface IOrganizationSelectorProps {
  organization?: ArrayElement<LoginReturnType['organizations']>
  collapsed: boolean
  isInAdminApp: boolean
}
export default memo(function OrganizationSelector (props: IOrganizationSelectorProps) {
  const { collapsed, organization, isInAdminApp } = props

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { data: identity } = useIdentity()
  const router = useRouter()

  // The organizations should be shorted alphabetically BUT
  // the personal organization should always be placed at the top
  const orgs = (identity?.organizations || []).sort((org1, org2) => {
    if (org1.isUnitary) {
      return org2.isUnitary ? org1.name.localeCompare(org2.name) : -1
    } else if (org2.isUnitary) {
      return 1
    } else {
      return org1.name.localeCompare(org2.name)
    }
  })

  // Gets how the current org should be displayed to the end user
  const activeOrgName = isInAdminApp ? 'Panfactum Admin' : (organization && !organization.isUnitary) ? organization.name : 'Personal'

  // We do not want to show the active organization in the dropdown
  // selection
  const orgOptions = orgs.filter(org => org.id !== organization?.id)

  // Whether to show the admin app in the org switcher
  const showAdmin = Boolean(identity && identity.panfactumRole !== null)

  const open = Boolean(anchorEl)
  const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [setAnchorEl])
  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [setAnchorEl])
  const handleSelect = useCallback((id: string) => {
    if (id === 'admin') {
      router.push('/a/admin')
    } else {
      router.push(`/a/o/${id}`)
    }
    setAnchorEl(null)
  }, [router, setAnchorEl])

  return (
    <div>
      <DefaultTooltipLazy
        title="Organization Selector"
        disableHoverListener={!collapsed}
        disableFocusListener={!collapsed}
      >
        <Button
          id="organization-button"
          aria-controls={open ? 'organization-selector' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          className={`${collapsed ? 'p-2' : 'w-full'} min-w-0 flex justify-between bg-primary xl:text-base`}
          variant="contained"
        >
          {!collapsed && (
            <div>
              {activeOrgName}
            </div>
          )}
          <ArrowDropDownIcon/>
        </Button>
      </DefaultTooltipLazy>
      <Menu
        id="organization-selector"
        MenuListProps={{
          'aria-labelledby': 'organization-button',
          className: 'w-72 px-4'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {orgOptions.length > 1 && (
          <div className="flex my-1 gap-3">
            <div className="uppercase text-secondary font-bold ">
              Switch Organization
            </div>
            <div className="border-0 h-0.5 bg-gray-dark mx-0 my-3 grow"/>
          </div>
        )}
        {orgOptions.map(org => (
          <MenuItem
            key={org.id}
            onClick={() => handleSelect(org.id)}
            className="px-2"
          >
            {org.isUnitary ? 'Personal' : org.name}
          </MenuItem>
        ))}
        {showAdmin && (
          <MenuItem
            onClick={() => handleSelect('admin')}
            className="px-2"
          >
            Panfactum Admin
          </MenuItem>
        )}
        {orgOptions.length > 0 && <hr className="border-0 h-0.5 bg-secondary mx-0 my-2"/>}
        <MenuItem
          onClick={handleClose}
          className="flex justify-between px-2"
        >
          Create Organization
          <AddIcon/>
        </MenuItem>
      </Menu>
    </div>
  )
})
