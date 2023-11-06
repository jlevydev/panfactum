import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import type { Theme } from '@mui/material'
import { useMediaQuery } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import { unstable_useId as useId } from '@mui/utils'
import {
  gridClasses,
  gridFilterActiveItemsSelector,
  GridMenu,
  gridPreferencePanelStateSelector,
  GridPreferencePanelsValue,
  GridToolbarContainer,
  useGridApiContext,
  useGridRootProps,
  useGridSelector
} from '@mui/x-data-grid-pro'
import type { FC } from 'react'
import React, { forwardRef, memo, useCallback, useRef, useState } from 'react'

import ActionButton from '@/components/datagrid/ActionButton'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import GenericMemo from '@/components/util/GenericMemo'
import type { CRUDResultType } from '@/lib/hooks/queries/util/CRUDResultType'

/************************************************
 * Create Button
 * **********************************************/
interface GridToolbarCreateButtonProps {onCreate:() => void}
export const GridToolbarCreateButton = memo(forwardRef<HTMLButtonElement, GridToolbarCreateButtonProps>(
  function GridToolbarColumnsButton ({ onCreate }, ref) {
    return (
      <ActionButton
        ref={ref}
        aria-label={'Create new item'}
        onClick={onCreate}
        tooltipText={'Create new item'}
        Icon={<AddCircleOutlineIcon className="text-[1.1rem] xl:text-[1.7rem]"/>}
        active={true}
      >
        Create
      </ActionButton>
    )
  }
))

/************************************************
 * Columns Button
 * **********************************************/

export const GridToolbarColumnsButton = memo(forwardRef<HTMLButtonElement>(
  function GridToolbarColumnsButton (_, ref) {
    const columnButtonId = useId()
    const columnPanelId = useId()

    const apiRef = useGridApiContext()
    const rootProps = useGridRootProps()
    const { open, openedPanelValue, panelId } = useGridSelector(apiRef, gridPreferencePanelStateSelector)

    const showColumns = useCallback(() => {
      if (
        open &&
        openedPanelValue === GridPreferencePanelsValue.columns
      ) {
        apiRef.current?.hidePreferences()
      } else {
        apiRef.current?.showPreferences(
          GridPreferencePanelsValue.columns,
          columnPanelId,
          columnButtonId
        )
      }
    }, [apiRef, open, openedPanelValue, columnPanelId, columnButtonId])

    // Disable the button if the corresponding is disabled
    if (rootProps.disableColumnSelector) {
      return null
    }

    const isOpen = open && panelId === columnPanelId

    return (
      <ActionButton
        ref={ref}
        id={columnButtonId}
        aria-label={apiRef.current.getLocaleText('toolbarColumnsLabel')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? columnPanelId : undefined}
        onClick={showColumns}
        tooltipText={'Column selector'}
        Icon={<rootProps.slots.columnSelectorIcon className="text-[1.5rem] xl:text-[2rem]"/>}
      >
        {apiRef.current.getLocaleText('toolbarColumns')}
      </ActionButton>
    )
  }
))

/************************************************
 * Export Button
 * **********************************************/

const GridToolbarExportButton = memo(() => {
  const apiRef = useGridApiContext()
  const rootProps = useGridRootProps()
  const exportButtonId = useId()
  const exportMenuId = useId()

  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMenuOpen = useCallback(() => {
    setOpen((prevOpen) => !prevOpen)
  }, [setOpen])

  const handleMenuClose = useCallback(() => setOpen(false), [setOpen])
  const handleExportCsv = useCallback(() => {
    apiRef.current?.exportDataAsCsv()
    handleMenuClose()
  }, [apiRef, handleMenuClose])

  return (
    <>
      <ActionButton
        ref={buttonRef}
        size="small"
        Icon={<rootProps.slots.exportIcon className="text-[1.5rem] xl:text-[2rem]"/>}
        aria-expanded={open}
        aria-label={apiRef.current?.getLocaleText('toolbarExportLabel')}
        aria-haspopup="menu"
        aria-controls={open ? exportMenuId : undefined}
        id={exportButtonId}
        onClick={handleMenuOpen}
        tooltipText={'Export current list'}
      >
        {apiRef.current?.getLocaleText('toolbarExport')}
      </ActionButton>
      {buttonRef && (
        <GridMenu
          open={open}
          target={buttonRef.current}
          onClose={handleMenuClose}
          position="bottom-start"
        >
          <MenuList
            id={exportMenuId}
            className={gridClasses.menuList}
            aria-labelledby={exportButtonId}
            autoFocusItem={open}
          >
            <MenuItem
              className={'text-xs'}
              onClick={handleExportCsv}
            >
              {apiRef.current?.getLocaleText('toolbarExportCSV')}
            </MenuItem>
          </MenuList>
        </GridMenu>
      )}

    </>
  )
})

/************************************************
 * Filter Button
 * **********************************************/

const GridToolbarFilterButton = memo(forwardRef<HTMLButtonElement>(
  function GridToolbarFilterButton (_, ref) {
    const apiRef = useGridApiContext()
    const rootProps = useGridRootProps()
    const activeFilters = useGridSelector(apiRef, gridFilterActiveItemsSelector)
    const preferencePanel = useGridSelector(apiRef, gridPreferencePanelStateSelector)
    const filterButtonId = useId()
    const filterPanelId = useId()
    const { open, openedPanelValue } = preferencePanel

    const toggleFilter = useCallback(() => {
      if (open && openedPanelValue === GridPreferencePanelsValue.filters) {
        apiRef.current?.hidePreferences()
      } else {
        apiRef.current?.showPreferences(
          GridPreferencePanelsValue.filters,
          filterPanelId,
          filterButtonId
        )
      }
    }, [open, openedPanelValue, apiRef, filterPanelId, filterButtonId])

    // Disable the button if the corresponding is disabled
    if (rootProps.disableColumnFilter) {
      return null
    }

    const isOpen = preferencePanel.open && preferencePanel.panelId === filterPanelId
    return (
      <ActionButton
        ref={ref}
        id={filterButtonId}
        size="small"
        aria-label={apiRef.current?.getLocaleText('toolbarFiltersLabel')}
        aria-controls={isOpen ? filterPanelId : undefined}
        aria-expanded={isOpen}
        aria-haspopup
        active={activeFilters.length > 0}
        Icon={(
          <rootProps.slots.openFilterButtonIcon className="text-[1.5rem] xl:text-[2rem]"/>
        )}
        onClick={toggleFilter}
        tooltipText={'Select filters'}
      >
        {apiRef.current?.getLocaleText('toolbarFilters')}
      </ActionButton>
    )
  }
))

/************************************************
 * Main Toolbar
 * **********************************************/
export type BulkActionComponent<ResultType extends CRUDResultType> = FC<{
  data: ResultType[],
  selectedIds: string[],
  onUnselectItems: () => void
}>
export interface IActionToolbarProps<ResultType extends CRUDResultType> {
  BulkActions?: BulkActionComponent<ResultType>
  selectedIds: string[]
  data: ResultType[]
  onUnselectItems: () => void,
  onCreate?: () => void
}

export default GenericMemo(function ActionToolbar<ResultType extends CRUDResultType> (props: IActionToolbarProps<ResultType>) {
  const { selectedIds, BulkActions, data, onUnselectItems, onCreate } = props
  const isXL = useMediaQuery<Theme>(theme =>
    theme.breakpoints.up('xl')
  )
  return (
    <GridToolbarContainer className="h-[2.25rem] min-h-[2.25rem] md:h-[2.75rem] md:min-h-[2.75rem] xl:h-[4rem] xl:min-h-[4rem] xl:pb-1 relative m-0 w-full">
      <div className="w-full flex justify-end items-end h-full">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExportButton />
        {onCreate && <GridToolbarCreateButton onCreate={onCreate}/> }
      </div>
      <div
        className="absolute bottom-0 w-full z-10 bg-gray-light ease-in-out transition-all flex justify-between overflow-hidden items-center"
        style={{ height: selectedIds.length === 0 ? '0px' : (isXL ? '4rem' : '2.25rem') }}
      >
        <div className="h-full flex items-center px-4">
          <BulkActionButton
            actionType="danger"
            className="bg-red"
            tooltipText={'Clear selected items'}
            Icon={<CloseIcon fontSize={'2rem' as 'small'}/>}
            onClick={() => {
              onUnselectItems()
            }}
          >
            Unselect
            {' '}
            {selectedIds.length}
          </BulkActionButton>
        </div>
        <div className="h-full flex items-center px-4 gap-2">
          {BulkActions && data && (
            <BulkActions
              data={data}
              selectedIds={selectedIds}
              onUnselectItems={onUnselectItems}
            />
          )}
        </div>
      </div>
    </GridToolbarContainer>
  )
})
