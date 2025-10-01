'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Table as TanstackTable,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import * as React from 'react';

import { Box } from '@/components/box';
import { Button } from '@/components/common/button';
import { Space } from '@/components/space';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  showPagination?: boolean;
  showRowCount?: boolean;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  initialSorting?: SortingState;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
  className?: string;
  tableClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  showPagination = true,
  showRowCount = true,
  onRowClick,
  getRowId,
  initialSorting = [],
  emptyMessage = 'No data available',
  loading = false,
  className,
  tableClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  });

  if (loading) {
    return (
      <Box align="center" justify="center" className="py-12">
        <Space size={2} className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </Space>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box align="center" justify="center" className="py-12">
        <div className="text-center text-muted-foreground">{emptyMessage}</div>
      </Box>
    );
  }

  return (
    <div className={className}>
      <div
        className={`border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${tableClassName}`}
      >
        <table className="w-full">
          <thead className="border-b-2 border-foreground bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-4 py-3 text-left text-sm font-semibold"
                    style={{
                      width: header.column.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`
                  border-b border-foreground/20 hover:bg-secondary/50 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm"
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <DataTablePagination table={table} showRowCount={showRowCount} totalCount={data.length} />
      )}
    </div>
  );
}

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>;
  showRowCount?: boolean;
  totalCount?: number;
}

export function DataTablePagination<TData>({
  table,
  showRowCount = true,
  totalCount,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const rowCount = totalCount ?? table.getFilteredRowModel().rows.length;

  const fromRow = pageIndex * pageSize + 1;
  const toRow = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <Box align="center" justify="between" className="py-4">
      {showRowCount && (
        <div className="text-sm text-muted-foreground">
          {rowCount > 0 ? (
            <>
              Showing {fromRow} to {toRow} of {rowCount} {rowCount === 1 ? 'row' : 'rows'}
            </>
          ) : (
            'No results'
          )}
        </div>
      )}
      <Box gap={2}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {pageCount || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </Box>
    </Box>
  );
}
