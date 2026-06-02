import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TablePagination } from '@/components/table-pagination'
import { TableSkeleton } from '@/components/table-skeleton'

export type DataTableColumn = string | { label: React.ReactNode; className?: string; width?: string }

export type DataTableField<T> = keyof T | ((row: T, index: number) => React.ReactNode)

export type DataTablePagination = {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export type DataTableProps<T> = {
  data: T[]
  column: DataTableColumn[]
  field: DataTableField<T>[]
  pagination?: DataTablePagination
  loading?: boolean
  empty?: React.ReactNode
  rowKey?: (row: T, index: number) => string | number
  onRowClick?: (row: T) => void
  skeletonRows?: number
  className?: string
  cellClassNames?: (string | undefined)[]
}

function renderCell<T>(field: DataTableField<T>, row: T, index: number): React.ReactNode {
  if (typeof field === 'function') return field(row, index)
  const value = (row as any)[field]
  return value == null ? '—' : (value as React.ReactNode)
}

export function DataTable<T>({
  data,
  column,
  field,
  pagination,
  loading,
  empty,
  rowKey,
  onRowClick,
  skeletonRows = 6,
  className,
  cellClassNames,
}: DataTableProps<T>) {
  const headers = column.map((c) => (typeof c === 'string' ? { label: c } : c))
  const colCount = column.length

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h, i) => (
              <TableHead
                key={i}
                className={h.className}
                style={h.width ? { width: h.width } : undefined}
              >
                {h.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {loading ? (
          <TableSkeleton columns={colCount} rows={skeletonRows} />
        ) : data.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={colCount} className="py-16 text-center">
                {empty ?? <span className="text-muted-foreground text-sm">Belum ada data</span>}
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {data.map((row, rIdx) => (
              <TableRow
                key={rowKey ? rowKey(row, rIdx) : rIdx}
                className={onRowClick ? 'cursor-pointer' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {field.map((f, cIdx) => (
                  <TableCell key={cIdx} className={cellClassNames?.[cIdx]}>
                    {renderCell(f, row, rIdx)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      {pagination && (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  )
}
