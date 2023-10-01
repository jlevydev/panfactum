import AddIcon from '@mui/icons-material/Add'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useIdentityQuery } from '@/lib/providers/auth/authProvider'

export default function OrganizationSelector (props: {collapsed?: boolean}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { orgId } = useParams()
  const navigate = useNavigate()
  const { data: identity } = useIdentityQuery()
  const { collapsed = false } = props

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

  // Gets the active organization and how it should be displayed to the end user
  const activeOrg = orgs.find(org => org.id === orgId)
  const activeOrgName = (activeOrg && !activeOrg.isUnitary) ? activeOrg.name : 'Personal'

  // We do not want to show the active organization in the dropdown
  // selection
  const orgOptions = orgs.filter(org => org.id !== activeOrg?.id)

  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleSelect = (id: string) => {
    navigate(`/o/${id}`)
    setAnchorEl(null)
  }

  return (
    <div>
      <Tooltip
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
          className={`${collapsed ? 'p-2' : 'w-full'} min-w-0 flex justify-between bg-primary`}
          variant="contained"
        >
          {!collapsed && (
            <div>
              {activeOrgName}
            </div>
          )}
          <ArrowDropDownIcon/>
        </Button>
      </Tooltip>
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
            <div className="border-0 h-0.5 bg-base-300 mx-0 my-3 grow"/>
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
        {orgOptions.length > 1 && <hr className="border-0 h-0.5 bg-secondary mx-0 my-2"/>}
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
}
