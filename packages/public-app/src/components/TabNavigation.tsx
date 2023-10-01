import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import type { ReactElement } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'

// Renders the tab content
interface ITabPanelProps {
  children?: React.ReactNode;
  tab: string;
  currentTab: string;
}

function TabPanel (props: ITabPanelProps) {
  const { children, currentTab, tab, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={currentTab !== tab}
      id={`nav-tabpanel-${tab}`}
      aria-labelledby={`nav-tab-${tab}`}
      {...other}
    >
      {currentTab === tab && children}
    </div>
  )
}

// Renders the tabbed navigation page
interface ITabNavigationProps {
  nested?: boolean
  tabs: Array<{
    label: string;
    path: string;
    element: ReactElement;
  }>
  defaultPath: string;
  header?: ReactElement;
}
function TabNavigationController (props: ITabNavigationProps) {
  const { tabs, defaultPath, header, nested = false } = props
  const { tab, nestedTab } = useParams()

  const actualTabParam = nested ? nestedTab : tab

  if (actualTabParam === undefined) {
    return (
      <Navigate
        to={defaultPath}
        relative="route"
        replace={true}
      />
    )
  }

  const content = (
    <>
      <div>
        {header && header}
      </div>
      <Box className={`border-b-2 border-solid border-base-100 flex items-center ${nested ? '' : ''}`}>
        <Tabs
          value={actualTabParam}
          aria-label="tab navigation"
          variant="scrollable"
          scrollButtons="auto"
          className="w-full"
        >
          {tabs.map(({ label, path }) => (
            <Tab
              key={path}
              id={`nav-tab-${path}`}
              aria-controls={`nav-tabpanel-${path}`}
              disableRipple
              label={label}
              value={path}
              to={`../${path}`}
              relative="route"
              component={Link}
              className={`normal-case text-black ${nested ? 'text-base' : 'text-lg'}`}
            />
          ))}
        </Tabs>
      </Box>
      {tabs.map(({ path, element }) => (
        <TabPanel
          currentTab={actualTabParam}
          tab={path}
          key={path}
        >
          {element}
        </TabPanel>
      ))}
    </>
  )

  if (nested) {
    return (
      <Box>
        {content}
      </Box>
    )
  } else {
    return (
      <Box>
        <Paper>
          {content}
        </Paper>
      </Box>
    )
  }
}

// Adds the routing functionality and then defers logic
// to the controller
export default function TabNavigation (props: ITabNavigationProps) {
  return (
    <>
      <Routes>
        <Route
          path={props.nested ? ':nestedTab?' : ':tab?/*'}
          element={<TabNavigationController {...props}/>}
        />
      </Routes>
      <Outlet/>
    </>
  )
}
