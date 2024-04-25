import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react'
import {
  Column,
  Table as TableType,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  RowData,
} from '@tanstack/react-table'
import {QueryClient, QueryClientProvider, useInfiniteQuery} from '@tanstack/react-query'
import {useVirtual} from 'react-virtual'
import {Box, Card, Flex, Heading, Text} from '@sanity/ui'
import {Cell} from './cell/Cell'
import {HeaderCell} from './cell/HeaderCell'
import {StyledHeaderGroup, StyledRow, StyledRowGroup, StyledTable} from './table.styles'
import {Pagination} from '../pagination/pagination'

// Generic table component props and implementation
// export interface TableHeaders {
//   title: string
//   sortable: boolean
// }

// export interface TableColumns {
//   field: any
//   fieldPath: string
//   title: string
//   level: number
//   sortable: boolean
// }

export interface TableProps<T> {
  columns: ColumnDef<T>[] | ColumnDef<T>[][]
  data: Array<T>
  isLoading?: boolean
  onRowClick?: (row: any) => void
  pageSize?: number
}

const fetchSize = 25

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

function useSkipper() {
  const shouldSkipRef = useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}

const DEFAULT_PAGE_SIZE = 20

export function Table<T>(props: TableProps<T>) {
  const [rowSelection, setRowSelection] = useState({})

  const {columns, data: initialData, isLoading, onRowClick, pageSize = DEFAULT_PAGE_SIZE} = props
  const [data, setData] = useState<Array<T>>(() => initialData)
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  // const defaultColumn: Partial<ColumnDef<T>> = {
  //     cell: ({ getValue, row: { index }, column: { id }, table }) => {
  //       const initialValue = getValue()
  //       // We need to keep and update the state of the cell normally
  //       const [value, setValue] = useState(initialValue)

  //       // When the input is blurred, we'll call our table meta's updateData function
  //       const onBlur = () => {
  //         table.options.meta?.updateData(index, id, value)
  //       }

  //       // If the initialValue is changed external, sync it up with our state
  //       useEffect(() => {
  //         setValue(initialValue)
  //       }, [initialValue])

  //       return (
  //         <input
  //           value={value as string}
  //           onChange={e => setValue(e.target.value)}
  //           onBlur={onBlur}
  //         />
  //       )
  //     },
  //   }
  const defaultColumn: Partial<ColumnDef<T>> = {
    cell: ({getValue, row: {index}, column: {id}, table}) => {
      const initialValue = getValue()

      return <>{initialValue}</>
    },
  }

  const table = useReactTable<T>({
    data,
    columns,
    state: {
      rowSelection,
    },
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex()
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              }
            }
            return row
          }),
        )
      },
    },
    debugTable: true,
  })

  const handleSetPage = useCallback(
    (page: number) => {
      table.setPageIndex(page - 1)
    },
    [table],
  )

  useEffect(() => {
    table.setPageSize(pageSize)
  }, [table, pageSize])

  console.log(rowSelection)

  return (
    <Card>
      <Flex justify="space-between" align="center">
        <Box>
          <Pagination
            isEditable
            totalPages={table.getPageCount()}
            currentPage={table.getState().pagination.pageIndex + 1}
            onPageChange={handleSetPage}
          />
        </Box>
        <Box>
          <Text>
            {Object.keys(rowSelection).length} of {table.getPreFilteredRowModel().rows.length} Total
            Rows Selected
          </Text>
        </Box>
      </Flex>
      <Box paddingY={4}>
        <Heading>{data.length} items</Heading>
      </Box>
      <StyledTable>
        <StyledHeaderGroup>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <HeaderCell key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {/* {header.column.getCanFilter() ? (
                          <>
                            <Filter column={header.column} table={table} />
                            <span>Filter</span>
                          </>
                        ) : null} */}
                      </>
                    )}
                  </HeaderCell>
                )
              })}
            </tr>
          ))}
        </StyledHeaderGroup>
        <StyledRowGroup>
          {table.getRowModel().rows.map((row) => {
            return (
              <StyledRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Cell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Cell>
                  )
                })}
              </StyledRow>
            )
          })}
        </StyledRowGroup>
      </StyledTable>
    </Card>
  )
}
