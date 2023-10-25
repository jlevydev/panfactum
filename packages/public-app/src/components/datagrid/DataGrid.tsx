import type { InputLabelProps } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Select from '@mui/material/Select'
import type { SelectProps } from '@mui/material/Select'
import {
  DataGridPro as MuiDataGrid, GRID_CHECKBOX_SELECTION_COL_DEF,
  gridClasses,
  useGridApiRef

} from '@mui/x-data-grid-pro'
import type {
  GridFilterModel
  , GridRowParams, GridRowSelectionModel, GridSortModel, MuiEvent
  , GridInitialState
  , GridRenderCellParams
} from '@mui/x-data-grid-pro'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import type {
  ReactElement,
  ReactFragment,
  MouseEvent,
  FC
} from 'react'

import type { BulkActionComponent } from '@/components/datagrid/ActionToolbar'
import ActionToolbar from '@/components/datagrid/ActionToolbar'
import GridFilterPanel from '@/components/datagrid/GridFilterPanel'
import { createColumnConfig } from '@/components/datagrid/columns'
import type { CustomColDef, TypedFilterModel } from '@/components/datagrid/types'
import RowSelectionField from '@/components/fields/boolean/RowSelectionField'
import GenericMemo from '@/components/util/GenericMemo'
import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'
import type { CRUDResultType } from '@/lib/hooks/queries/util/CRUDResultType'
import type { FilterConfig, FilterParamList } from '@/lib/hooks/queries/util/FilterTypes'
import type {
  RQGetResourceHookFactory
} from '@/lib/hooks/queries/util/RQGetResourceHookFactory'
import useIsXSmall from '@/lib/hooks/ui/useIsXSmall'

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
 * Main Datagrid
 * **********************************************/

interface SortSettings<SortType extends string> {
  field: SortType,
  order: 'ASC' | 'DESC'
}
interface IDataGridProps<ResultType extends CRUDResultType, SortType extends string, FilterType extends FilterConfig<ResultType>> {
  columns: CustomColDef<ResultType, FilterType>[]
  defaultSort?: SortSettings<SortType>
  onRowClick?: (record: ResultType) => void
  empty?: ReactElement | null
  useGetList: ReturnType<typeof RQGetResourceHookFactory<ResultType, SortType, FilterType>>['useGetList']
  BulkActions?: BulkActionComponent<ResultType>
  permanentFilters?: FilterParamList<ResultType, FilterType>
  onCreate?: () => void
}

export default GenericMemo(function DataGrid<ResultType extends CRUDResultType, SortType extends string, FilterType extends FilterConfig<ResultType>> (
  props: IDataGridProps<ResultType, SortType, FilterType>
) {
  const {
    useGetList,
    columns,
    defaultSort,
    BulkActions,
    onRowClick,
    empty,
    permanentFilters,
    onCreate
  } = props

  const [tempFilterModel, setTempFilterModel] = useState<TypedFilterModel<ResultType, FilterType>>({ items: [] })
  const [filterModel, setFilterModel] = useState<TypedFilterModel<ResultType, FilterType>>({ items: [] })

  const [sort, setSort] = useState<SortSettings<SortType> | undefined>(defaultSort)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { data: results, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useGetList({
    sort,
    filters: filterModel.items.concat(permanentFilters ?? [])
  })

  const resultPages = useMemo(() => results?.pages ?? [], [results])
  const data = useMemo(() => {
    return resultPages.map(page => page.data).flat(1)
  }, [resultPages])

  const apiRef = useGridApiRef()
  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>()
  const isXSmall = useIsXSmall()

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
    if (data && apiRef.current && data.length > 0 && data.length < 100) {
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
        renderCell: (params: GridRenderCellParams<ResultType, boolean>) => (
          <RowSelectionField
            id={params.row.id}
            value={params.value}
            hasFocus={params.hasFocus}
            tabIndex={params.tabIndex}
            rowType={params.rowNode.type}
            selectable={params.api.isRowSelectable(params.id)}
            label={ apiRef.current?.getLocaleText(
              params.value ? 'checkboxSelectionUnselectRow' : 'checkboxSelectionSelectRow'
            )}
            onSelect={apiRef.current?.publishEvent}
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

    if (apiRef.current?.state.preferencePanel.open) {
      apiRef.current?.hidePreferences()
    } else if (onRowClick) {
      const record = data.find(record => record.id === params.id)
      if (record !== undefined) {
        onRowClick(record)
      }
    }
  }, [data, onRowClick, apiRef])

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    const [sort] = model as Array<{field: SortType, sort: 'asc' | 'desc'}>
    if (sort) {
      setSort({ field: sort.field, order: sort.sort === 'asc' ? 'ASC' : 'DESC' })
    } else if (defaultSort && filterModel.items.length === 0) {
      // Note: We don't apply the default sort if we have filters active because some
      // filters (e.g., search) apply server-side ordering
      setSort(defaultSort)
    } else {
      // We cannot clear the sort, so this will represent the "don't override filter sorts" state
      setSort({ field: 'id' as SortType, order: 'DESC' })
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
    // We trust the underlying library to ensure this type conversion is accurate (which conceptually it should be)
    setTempFilterModel(model as TypedFilterModel<ResultType, FilterType>)
  }, [setTempFilterModel])
  const onPreferencePanelClose = useCallback(() => {
    setFilterModel(tempFilterModel)
  }, [setFilterModel, tempFilterModel])

  const handleRowSelectionModelChange = useCallback((model: GridRowSelectionModel) => {
    setTimeout(() => setSelectedIds(model as string[]), 1)
  }, [setSelectedIds])

  const handleUnselectItems = useCallback(() => {
    setSelectedIds([])
  }, [setSelectedIds])
  const isSelectionEnabled = Boolean(BulkActions)
  const MemoizedActionToolbar = useMemo<FC>(() => {
    return () => {
      return (
        <ActionToolbar
          BulkActions={BulkActions}
          data={data}
          selectedIds={selectedIds}
          onUnselectItems={handleUnselectItems}
          onCreate={onCreate}
        />
      )
    }
  }, [BulkActions, handleUnselectItems, data, selectedIds, onCreate])

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
  if (!isLoading && data && data.length === 0 && empty !== undefined && Object.keys(filterModel.items).length === 0) {
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
        filterModel={tempFilterModel}
        onFilterModelChange={handleFilterModelChange}
        onPreferencePanelClose={onPreferencePanelClose}
      />
    )
  }

  return (
    <div
      ref={contentRef}
      className="w-full"
      style={{
        height: distanceFromBottom === 0 ? 'initial' : `${distanceFromBottom - 16}px`
      }}
    >
      {content}
    </div>

  )
})
