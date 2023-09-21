import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Fade from '@mui/material/Fade'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import AddIcon from '@mui/icons-material/Add'
import { useIdentityQuery } from '@/lib/providers/auth/authProvider'

export default function OrganizationSelector () {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { orgId } = useParams()
  const navigate = useNavigate()
  const { data: identity } = useIdentityQuery()

  const orgs = identity?.organizations || []
  const activeOrg = orgs.find(org => org.id === orgId)
  const activeOrgName = (activeOrg && !activeOrg.isUnitary) ? activeOrg.name : 'Personal'

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
    <div className="pb-4">
      <Button
        id="organization-button"
        aria-controls={open ? 'organization-selector' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className="w-full flex justify-between bg-primary"
        variant="contained"
      >
        {activeOrgName}
        <ArrowDropDownIcon/>
      </Button>
      <Menu
        id="organization-selector"
        MenuListProps={{
          'aria-labelledby': 'organization-button',
          className: 'w-64'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {orgs.map(org => (
          <MenuItem
            key={org.id}
            onClick={() => handleSelect(org.id)}
          >
            {org.isUnitary ? 'Personal' : org.name}
          </MenuItem>
        ))}
        <hr className="border-top-2 border-secondary border-base-100 m-2"/>
        <MenuItem
          onClick={handleClose}
          className="flex justify-between"
        >
          Create Organization
          <AddIcon/>
        </MenuItem>
      </Menu>
    </div>
  )
}
