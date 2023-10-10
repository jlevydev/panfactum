import CloseIcon from '@mui/icons-material/Close'
import type { InputLabelProps, TooltipProps, Theme } from '@mui/material'
import { MenuList, useMediaQuery } from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectProps } from '@mui/material/Select'
import { unstable_useId as useId } from '@mui/utils'
import {
  DataGridPro as MuiDataGrid, GRID_CHECKBOX_SELECTION_COL_DEF,
  gridClasses,
  gridFilterActiveItemsSelector,
  GridMenu,
  gridPreferencePanelStateSelector,
  GridPreferencePanelsValue,
  GridToolbarContainer,
  useGridApiContext,
  useGridApiRef,
  useGridRootProps,
  useGridSelector

} from '@mui/x-data-grid-pro'
import type {
  GridCsvExportOptions,
  GridFilterModel,
  GridPrintExportOptions
  , GridRowParams, GridRowSelectionModel, GridSortModel, MuiEvent
  , GridInitialState
  , GridRenderCellParams
} from '@mui/x-data-grid-pro'
import React, {
  forwardRef, useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type {
  ReactElement,
  ReactFragment,
  MouseEvent,
  FC
} from 'react'
import {
  InfiniteListBase,
  useInfinitePaginationContext,
  useListContext
} from 'react-admin'
import type {
  InfiniteListProps, RaRecord,
  SortPayload,
  FilterPayload
} from 'react-admin'

import ActionButton from '@/components/datagrid/ActionButton'
import BulkActionButton from '@/components/datagrid/BulkActionButton'
import GridFilterPanel from '@/components/datagrid/GridFilterPanel'
import { createColumnConfig } from '@/components/datagrid/columns'
import { convertDGtoRAFilters, convertRAtoDGFilters } from '@/components/datagrid/filters'
import type { CustomColDef, Filters } from '@/components/datagrid/types'
import RowSelectionField from '@/components/fields/boolean/RowSelectionField'
import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'

/************************************************
 * Base Components
 * **********************************************/

function CustomNoRowsOverlay () {
  return (
    <div className="flex items-center justify-center h-full text-xl lg:text-2xl">
      No results. Try changing your filter values.
    </div>
  )
}

function CustomBaseSelect (props: SelectProps) {
  return (
    <Select
      {...props}
      className="text-sm xl:text-base"
    />
  )
}

function CustomBaseInputLabel (props: InputLabelProps) {
  return (
    <InputLabel
      {...props}
      className="text-sm xl:text-base"
    />
  )
}

/************************************************
 * Action Toolbar
 * **********************************************/

export interface GridExportDisplayOptions {
  /**
   * If `true`, this export option will be removed from the GridToolbarExport menu.
   * @default false
   */
  disableToolbarButton?: boolean;
}

export interface GridExportMenuItemProps<Options extends object> {
  hideMenu?: () => void;
  options?: Options & GridExportDisplayOptions;
}

export type GridCsvExportMenuItemProps = GridExportMenuItemProps<GridCsvExportOptions>;

export type GridPrintExportMenuItemProps = GridExportMenuItemProps<GridPrintExportOptions>;

export function GridCsvExportMenuItem (props: GridCsvExportMenuItemProps) {
  const apiRef = useGridApiContext()
  const { hideMenu, options, ...other } = props

  return (
    <MenuItem
      className={'text-xs'}
      onClick={() => {
        apiRef.current.exportDataAsCsv(options)
        hideMenu?.()
      }}
      {...other}
    >
      {apiRef.current.getLocaleText('toolbarExportCSV')}
    </MenuItem>
  )
}

export function GridPrintExportMenuItem (props: GridPrintExportMenuItemProps) {
  const apiRef = useGridApiContext()
  const { hideMenu, options, ...other } = props

  return (
    <MenuItem
      className={'text-xs'}
      onClick={() => {
        apiRef.current.exportDataAsPrint(options)
        hideMenu?.()
      }}
      {...other}
    >
      {apiRef.current.getLocaleText('toolbarExportPrint')}
    </MenuItem>
  )
}

function GridToolbarExportContainer (props: ButtonProps) {
  const { onClick, ...other } = props

  const apiRef = useGridApiContext()
  const rootProps = useGridRootProps()
  const exportButtonId = useId()
  const exportMenuId = useId()

  const [open, setOpen] = React.useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen((prevOpen) => !prevOpen)
    onClick?.(event)
  }

  const handleMenuClose = () => setOpen(false)

  return (
    <>
      <ActionButton
        ref={buttonRef}
        size="small"
        Icon={<rootProps.slots.exportIcon className="text-[1.5rem] xl:text-[2rem]"/>}
        aria-expanded={open}
        aria-label={apiRef.current.getLocaleText('toolbarExportLabel')}
        aria-haspopup="menu"
        aria-controls={open ? exportMenuId : undefined}
        id={exportButtonId}
        {...other}
        onClick={handleMenuOpen}
        {...rootProps.slotProps?.baseButton}
        tooltipText={'Export current list'}
      >
        {apiRef.current.getLocaleText('toolbarExport')}
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
            <GridCsvExportMenuItem hideMenu={handleMenuClose}/>
            <GridPrintExportMenuItem hideMenu={handleMenuClose}/>
          </MenuList>
        </GridMenu>
      )}

    </>
  )
}

export const GridToolbarColumnsButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function GridToolbarColumnsButton (props, ref) {
    const { onClick, ...other } = props
    const columnButtonId = useId()
    const columnPanelId = useId()

    const apiRef = useGridApiContext()
    const rootProps = useGridRootProps()
    const preferencePanel = useGridSelector(apiRef, gridPreferencePanelStateSelector)

    const showColumns = (event: MouseEvent<HTMLButtonElement>) => {
      if (
        preferencePanel.open &&
        preferencePanel.openedPanelValue === GridPreferencePanelsValue.columns
      ) {
        apiRef.current.hidePreferences()
      } else {
        apiRef.current.showPreferences(
          GridPreferencePanelsValue.columns,
          columnPanelId,
          columnButtonId
        )
      }

      onClick?.(event)
    }

    // Disable the button if the corresponding is disabled
    if (rootProps.disableColumnSelector) {
      return null
    }

    const isOpen = preferencePanel.open && preferencePanel.panelId === columnPanelId

    return (
      <ActionButton
        ref={ref}
        id={columnButtonId}
        aria-label={apiRef.current.getLocaleText('toolbarColumnsLabel')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? columnPanelId : undefined}
        {...other}
        onClick={showColumns}
        {...rootProps.slotProps?.baseButton}
        tooltipText={'Column selector'}
        Icon={<rootProps.slots.columnSelectorIcon className="text-[1.5rem] xl:text-[2rem]"/>}
      >
        {apiRef.current.getLocaleText('toolbarColumns')}
      </ActionButton>
    )
  }
)

export interface GridToolbarFilterButtonProps
  extends Omit<TooltipProps, 'title' | 'children' | 'componentsProps'> {
  /**
   * The props used for each slot inside.
   * @default {}
   */
  componentsProps?: { button?: ButtonProps };
}

const GridToolbarFilterButton = React.forwardRef<HTMLButtonElement, GridToolbarFilterButtonProps>(
  function GridToolbarFilterButton (props, ref) {
    const { componentsProps = {} } = props
    const buttonProps = componentsProps.button || {}
    const apiRef = useGridApiContext()
    const rootProps = useGridRootProps()
    const activeFilters = useGridSelector(apiRef, gridFilterActiveItemsSelector)
    const preferencePanel = useGridSelector(apiRef, gridPreferencePanelStateSelector)
    const filterButtonId = useId()
    const filterPanelId = useId()

    const toggleFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
      const { open, openedPanelValue } = preferencePanel
      if (open && openedPanelValue === GridPreferencePanelsValue.filters) {
        apiRef.current.hidePreferences()
      } else {
        apiRef.current.showPreferences(
          GridPreferencePanelsValue.filters,
          filterPanelId,
          filterButtonId
        )
      }
      buttonProps.onClick?.(event)
    }

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
        aria-label={apiRef.current.getLocaleText('toolbarFiltersLabel')}
        aria-controls={isOpen ? filterPanelId : undefined}
        aria-expanded={isOpen}
        aria-haspopup
        active={activeFilters.length > 0}
        Icon={(
          <rootProps.slots.openFilterButtonIcon className="text-[1.5rem] xl:text-[2rem]"/>
        )}
        {...buttonProps}
        onClick={toggleFilter}
        {...rootProps.slotProps?.baseButton}
        tooltipText={'Select filters'}
      >
        {apiRef.current.getLocaleText('toolbarFilters')}
      </ActionButton>
    )
  }
)

interface IActionToolbarProps {
  BulkActions?: FC
}

function ActionToolbar ({ BulkActions }: IActionToolbarProps) {
  const { selectedIds, onUnselectItems, data } = useListContext<RaRecord<string>>()
  const isXL = useMediaQuery<Theme>(theme =>
    theme.breakpoints.up('xl')
  )
  return (
    <GridToolbarContainer className="h-[2.25rem] min-h-[2.25rem] xl:h-[4rem] xl:min-h-[4rem] xl:pb-1 relative m-0 ">
      <div className="w-full flex justify-end">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExportContainer />
      </div>
      <div
        className="absolute bottom-0 w-full z-10 bg-base-100 ease-in-out transition-all flex justify-between overflow-hidden items-center"
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
          {BulkActions && data && <BulkActions/>}
        </div>
      </div>
    </GridToolbarContainer>
  )
}

/************************************************
 * Main Datagrid
 * **********************************************/

interface IDataGridControllerProps<T extends RaRecord<string>, F extends Filters<T>> extends IActionToolbarProps {
  columns: CustomColDef<T, F>[]
  defaultSort?: SortPayload
  onRowClick?: (record: T) => void
  empty?: ReactElement | null
}

function DataGridController<T extends RaRecord<string>, F extends Filters<T>> (props: IDataGridControllerProps<T, F>) {
  const { columns, defaultSort, BulkActions, onRowClick, empty } = props
  const listContext = useListContext<T>()
  const { data, isLoading, setSort, sort, setFilters, onSelect, selectedIds } = listContext
  const filterValues = listContext.filterValues as FilterPayload // type defs are broken on this field
  const {
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useInfinitePaginationContext()
  const apiRef = useGridApiRef()
  const [filterModel, setFilterModel] = useState<GridFilterModel>(
    convertRAtoDGFilters(filterValues)
  )
  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>()
  const isXSmall = useMediaQuery<Theme>(theme =>
    theme.breakpoints.down('sm')
  )

  // We start and stop loading quickly in succession due to infinite scroll. This causes the loading indicator
  // to stutter as its state gets reset when loading temporarily pauses (even for <1 ms). This adds an artificial
  // 50ms delay to hiding the loading indicator to ensure we are truly done with the current sequence of loads
  const [isLoadingIndicatorVisible, setIsLoadingIndicatorVisible] = useState<boolean>(isLoading || isFetchingNextPage)
  useEffect(() => {
    if (isLoading || isFetchingNextPage) {
      setIsLoadingIndicatorVisible(true)
      return () => {}
    } else {
      const timeout = setTimeout(() => {
        setIsLoadingIndicatorVisible(false)
      }, 50)
      return () => clearTimeout(timeout)
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [isLoading, isFetchingNextPage, setIsLoadingIndicatorVisible]
  )

  useEffect(() => {
    // // This is a convenience that will autofit the columns when data is first being loaded.
    // // This compensates for the fact that we usually don't have the data on the first render/mount so the
    // // autoresize on mount doesn't do anything
    if (data && apiRef && apiRef.current && data.length > 0 && data.length < 100) {
      const timeout = setTimeout(() => {
        void apiRef.current?.autosizeColumns({ expand: true, includeHeaders: true, includeOutliers: true })
      }, 1)
      return () => clearTimeout(timeout)
    } else {
      return () => {}
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, fetchNextPage, distanceFromBottom, isFetchingNextPage, isLoading])

  // We have to memoize this as changing the object results in resetting the grid state (even if it has the same values)
  const augmentedColumns = useMemo(
    () => [
      // We use a custom checkbox element b/c the original
      // one is too heavy and causes page lag on render
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        headerName: 'Selected',
        renderCell: (params: GridRenderCellParams<T, boolean>) => (
          <RowSelectionField
            id={params.row.id}
            value={params.value}
            hasFocus={params.hasFocus}
            tabIndex={params.tabIndex}
            rowType={params.rowNode.type}
            selectable={params.api.isRowSelectable(params.id)}
            label={ apiRef.current.getLocaleText(
              params.value ? 'checkboxSelectionUnselectRow' : 'checkboxSelectionSelectRow'
            )}
            onSelect={apiRef.current.publishEvent}
          />
        )
      },
      ...createColumnConfig(columns)
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(columns)]
  )

  const handleRowClick = useCallback((params: GridRowParams, event: MuiEvent<MouseEvent>) => {
    event.preventDefault()
    event.stopPropagation()
    event.defaultMuiPrevented = true

    if (apiRef.current && apiRef.current.state.preferencePanel.open) {
      apiRef.current.hidePreferences()
    } else if (onRowClick) {
      const record = data.find(record => record.id === params.id)
      if (record !== undefined) {
        onRowClick(record)
      }
    }
  }, [data, onRowClick, apiRef])

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    console.log('sort changed', model, filterModel)
    const [sort] = model
    if (sort) {
      setSort({ field: sort.field, order: sort.sort === 'asc' ? 'ASC' : 'DESC' })
    } else if (defaultSort && filterModel.items.length === 0) {
      // Note: We don't apply the default sort if we have filters active because some
      // filters (e.g., search) apply server-side ordering
      setSort(defaultSort)
    } else {
      // We cannot clear the sort, so this will represent the "don't override filter sorts" state
      setSort({ field: 'id', order: 'DESC' })
    }
  }, [setSort, defaultSort, filterModel])

  const handleRowScrollEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      void fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, isLoading])

  // Save the filter model in local state so we can defer updating the RA filters
  // until the preference panel is closed to avoid unnecessary data fetching
  const handleFilterModelChange = useCallback((model: GridFilterModel) => {
    setFilterModel(model)
  }, [setFilterModel])
  const onPreferencePanelClose = useCallback(() => {
    setFilters(convertDGtoRAFilters(filterModel), {})
  }, [setFilters, filterModel])

  const handleRowSelectionModelChange = useCallback((model: GridRowSelectionModel) => {
    setTimeout(() => onSelect(model as string[]), 1)
  }, [onSelect])

  const isSelectionEnabled = Boolean(BulkActions)
  const MemoizedActionToolbar = useMemo<FC>(() => {
    return () => {
      return <ActionToolbar BulkActions={BulkActions}/>
    }
  }, [BulkActions])

  const columnVisibilityModel = useMemo<{[colName: string]: boolean}>(() => {
    return Object.fromEntries(columns.map(col => [col.field, col.hidden !== undefined ? !col.hidden : true] as const))
  }, [columns])

  const autosizeOptions = useMemo(() => ({
    expand: true,
    includeHeaders: true,
    includeOutliers: true
  }), [])

  const initialState = useMemo<GridInitialState>(() => ({
    sorting: {
      sortModel: sort ? [{ field: sort.field, sort: sort.order === 'ASC' ? 'asc' : 'desc' }] : []
    },
    columns: {
      columnVisibilityModel
    }
  }), [columnVisibilityModel, sort])

  const slots = useMemo(() => ({
    loadingOverlay: LinearProgress,
    toolbar: MemoizedActionToolbar,
    filterPanel: GridFilterPanel,
    baseSelect: CustomBaseSelect,
    baseInputLabel: CustomBaseInputLabel,
    noRowsOverlay: CustomNoRowsOverlay
  }), [MemoizedActionToolbar])

  const sx = useMemo(() => ({
    boxShadow: 0,
    border: 0,
    [`.${gridClasses.checkboxInput}, .${gridClasses.cellCheckbox}`]: {
      width: '30px',
      height: '30px'
    },
    [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
      outline: 'transparent'
    },
    [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
      outline: 'none'
    }
  }), [])

  // This is required b/c some things break if we render
  // the Datagrid without any data (e.g., rehydrating selections)
  let content: null | ReactElement | ReactFragment
  if (data && data.length === 0 && empty !== undefined && Object.keys(filterValues).length === 0) {
    content = empty
  } else {
    content = (
      <MuiDataGrid
        rows={data ?? []}
        autosizeOnMount={true}
        columns={augmentedColumns}
        loading={isLoadingIndicatorVisible}
        sortingMode="server"
        rowHeight={30}
        columnHeaderHeight={30}
        hideFooterPagination={true}
        hideFooter={isXSmall}
        checkboxSelection={isSelectionEnabled}
        apiRef={apiRef}
        autosizeOptions={autosizeOptions}
        onRowClick={handleRowClick}
        initialState={initialState}
        rowSelectionModel={selectedIds}
        onRowSelectionModelChange={handleRowSelectionModelChange}
        onSortModelChange={handleSortModelChange}
        onRowsScrollEnd={handleRowScrollEnd}
        scrollEndThreshold={distanceFromBottom / 2}
        slots={slots}
        sx={sx}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        onPreferencePanelClose={onPreferencePanelClose}
      />
    )
  }

  return (
    <div
      ref={contentRef}
      style={{
        height: distanceFromBottom === 0 ? 'initial' : `${distanceFromBottom - 16}px`
      }}
    >
      {content}
    </div>

  )
}

/************************************************
 * Root
 * **********************************************/

interface IDatagridProps<T extends RaRecord<string>, F extends Filters<T>> {
  listProps: Omit<InfiniteListProps, 'children'>,
  dataGridProps: IDataGridControllerProps<T, F>
}
export default function DataGrid<T extends RaRecord<string>, F extends Filters<T>> (props: IDatagridProps<T, F>) {
  const {
    listProps: {
      perPage = 100,
      ...otherListProps
    },
    dataGridProps
  } = props

  return (
    <InfiniteListBase
      {...otherListProps}
      perPage={perPage}
      debounce={10}
    >
      <DataGridController
        {...dataGridProps}
        defaultSort={otherListProps.sort}
      />
    </InfiniteListBase>
  )
}
