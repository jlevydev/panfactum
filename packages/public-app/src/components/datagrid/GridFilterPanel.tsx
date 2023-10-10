import FilterListIcon from '@mui/icons-material/FilterList'
import type { SxProps, Theme } from '@mui/material'
import type {
  GetColumnForNewFilterArgs,
  GridColDef,
  GridFilterFormProps,
  GridFilterItem
} from '@mui/x-data-grid-pro'
import {
  gridFilterableColumnDefinitionsSelector, GridFilterForm, gridFilterModelSelector, GridLogicOperator, GridPanelContent, GridPanelFooter, GridPanelWrapper,
  useGridApiContext, useGridRootProps, useGridSelector
} from '@mui/x-data-grid-pro'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'

export interface GridFilterPanelProps
  extends Pick<GridFilterFormProps, 'logicOperators' | 'columnsSort'> {
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * Function that returns the next filter item to be picked as default filter.
   * @param {GetColumnForNewFilterArgs} args Currently configured filters and columns.
   * @returns {GridColDef['field']} The field to be used for the next filter or `null` to prevent adding a filter.
   */
  getColumnForNewFilter?: (args: GetColumnForNewFilterArgs) => GridColDef['field'] | null;
  /**
   * Props passed to each filter form.
   */
  filterFormProps?: Pick<
    GridFilterFormProps,
    | 'columnsSort'
    | 'deleteIconProps'
    | 'logicOperatorInputProps'
    | 'operatorInputProps'
    | 'columnInputProps'
    | 'valueInputProps'
    | 'filterColumns'
  >;

  /**
   * If `true`, the `Add filter` button will not be displayed.
   * @default false
   */
  disableAddFilterButton?: boolean;
  /**
   * If `true`, the `Remove all` button will be disabled
   * @default false
   */
  disableRemoveAllButton?: boolean;

  /**
   * @ignore - do not document.
   */
  children?: React.ReactNode;
}

const getGridFilter = (col: GridColDef): GridFilterItem => ({
  field: col.field,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  operator: col.filterOperators![0]!.value,
  id: Math.round(Math.random() * 1e5)
})

// This was taken from the MUI DG source repo (https://github.com/mui/mui-x/blob/master/packages/grid/x-data-grid/src/components/panel/filterPanel/GridFilterPanel.tsx)
// so that we can customize it beyond want it's original interface allowed
const GridFilterPanel = forwardRef<HTMLDivElement, GridFilterPanelProps>(
  function GridFilterPanel (props, ref) {
    const apiRef = useGridApiContext()
    const rootProps = useGridRootProps()
    const filterModel = useGridSelector(apiRef, gridFilterModelSelector)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const filterableColumns = useGridSelector(apiRef, gridFilterableColumnDefinitionsSelector)
    const placeholderFilter = useRef<GridFilterItem | null>(null)

    const {
      columnsSort,
      getColumnForNewFilter,
      disableAddFilterButton = false,
      disableRemoveAllButton = false,
      ...other
    } = props
    const logicOperators = useMemo(() => [GridLogicOperator.And], [])

    const applyFilter = apiRef.current.upsertFilterItem

    const applyFilterLogicOperator = useCallback(
      (operator: GridLogicOperator) => {
        apiRef.current.setFilterLogicOperator(operator)
      },
      [apiRef]
    )

    const getDefaultFilter = useCallback((): GridFilterItem | null => {
      let nextColumnWithOperator
      if (getColumnForNewFilter && typeof getColumnForNewFilter === 'function') {
        // To allow override the column for default (first) filter
        const nextFieldName = getColumnForNewFilter({
          currentFilters: filterModel?.items || [],
          columns: filterableColumns
        })

        if (nextFieldName === null) {
          return null
        }

        nextColumnWithOperator = filterableColumns.find(({ field }) => field === nextFieldName)
      } else {
        nextColumnWithOperator = filterableColumns.find((colDef) => colDef.filterOperators?.length)
      }

      if (!nextColumnWithOperator) {
        return null
      }

      return getGridFilter(nextColumnWithOperator)
    }, [filterModel?.items, filterableColumns, getColumnForNewFilter])

    const getNewFilter = useCallback((): GridFilterItem | null => {
      if (getColumnForNewFilter === undefined || typeof getColumnForNewFilter !== 'function') {
        return getDefaultFilter()
      }

      const currentFilters = filterModel.items.length
        ? filterModel.items
        : [getDefaultFilter()].filter(Boolean)

      // If no items are there in filterModel, we have to pass defaultFilter
      const nextColumnFieldName = getColumnForNewFilter({
        currentFilters: currentFilters as GridFilterItem[],
        columns: filterableColumns
      })

      if (nextColumnFieldName === null) {
        return null
      }

      const nextColumnWithOperator = filterableColumns.find(
        ({ field }) => field === nextColumnFieldName
      )

      if (!nextColumnWithOperator) {
        return null
      }

      return getGridFilter(nextColumnWithOperator)
    }, [filterModel.items, filterableColumns, getColumnForNewFilter, getDefaultFilter])

    const items = useMemo<GridFilterItem[]>(() => {
      if (filterModel.items.length) {
        return filterModel.items
      }

      if (!placeholderFilter.current) {
        placeholderFilter.current = getDefaultFilter()
      }

      return placeholderFilter.current ? [placeholderFilter.current] : []
    }, [filterModel.items, getDefaultFilter])

    const hasMultipleFilters = items.length > 1

    const addNewFilter = () => {
      const newFilter = getNewFilter()
      if (!newFilter) {
        return
      }
      apiRef.current.upsertFilterItems([...items, newFilter])
    }

    const deleteFilter = useCallback(
      (item: GridFilterItem) => {
        const shouldCloseFilterPanel = items.length === 1
        apiRef.current.deleteFilterItem(item)
        if (shouldCloseFilterPanel) {
          apiRef.current.hideFilterPanel()
        }
      },
      [apiRef, items.length]
    )

    const handleRemoveAll = () => {
      const item = items[0]
      if (item) {
        apiRef.current.deleteFilterItem(item)
      }
      apiRef.current.setFilterModel({ ...filterModel, items: [] })
      apiRef.current.hideFilterPanel()
    }

    const handleApply = () => {
      apiRef.current.hideFilterPanel()
    }

    useEffect(() => {
      if (
        logicOperators.length > 0 &&
        filterModel.logicOperator &&
        !logicOperators.includes(filterModel.logicOperator)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        applyFilterLogicOperator(logicOperators[0]!)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logicOperators, applyFilterLogicOperator, filterModel.logicOperator])

    return (
      <GridPanelWrapper
        ref={ref}
        {...other}
      >
        <GridPanelContent>
          {items.map((item, index) => (
            <GridFilterForm
              key={item.id == null ? index : item.id}
              item={item}
              applyFilterChanges={applyFilter}
              deleteFilter={deleteFilter}
              hasMultipleFilters={hasMultipleFilters}
              showMultiFilterOperators={index > 0}
              multiFilterOperator={filterModel.logicOperator}
              disableMultiFilterOperator={index !== 1}
              applyMultiFilterOperatorChanges={applyFilterLogicOperator}
              logicOperators={logicOperators}
              columnsSort={columnsSort}
              logicOperatorInputProps={{
                className: 'hidden'
              }}
              columnInputProps={{
                className: 'w-20 xl:w-36'
              }}
              operatorInputProps={{
                className: 'w-16 xl:w-28'
              }}
              valueInputProps={{
                className: 'w-48 xl:w-96'
              }}
              deleteIconProps={{
                className: 'w-6 text-xs'
              }}
            />
          ))}
        </GridPanelContent>
        {!rootProps.disableMultipleColumnsFiltering &&
        !(disableAddFilterButton && disableRemoveAllButton)
          ? (
            <GridPanelFooter>
              <rootProps.slots.baseButton
                onClick={addNewFilter}
                startIcon={<rootProps.slots.filterPanelAddIcon />}
                {...rootProps.slotProps?.baseButton}
              >
                {apiRef.current.getLocaleText('filterPanelAddFilter')}
              </rootProps.slots.baseButton>
              <div className="flex flex-row gap-4">
                <rootProps.slots.baseButton
                  onClick={handleRemoveAll}
                  startIcon={<rootProps.slots.filterPanelRemoveAllIcon />}
                  {...rootProps.slotProps?.baseButton}
                >
                  {apiRef.current.getLocaleText('filterPanelRemoveAll')}
                </rootProps.slots.baseButton>
                <rootProps.slots.baseButton
                  onClick={handleApply}
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  {...rootProps.slotProps?.baseButton}
                >
                  Apply Filters
                </rootProps.slots.baseButton>
              </div>

            </GridPanelFooter>
          )
          : null}
      </GridPanelWrapper>
    )
  }
)

export default GridFilterPanel
