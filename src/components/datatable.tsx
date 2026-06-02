import * as React from 'react'
import { Inbox } from 'lucide-react'
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
  const isEmpty = !loading && data.length === 0

  if (isEmpty) {
    return (
      <div className={className}>
        {typeof empty === 'string' || empty == null ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Inbox className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium">Tidak ada data</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {(empty as string) ?? 'Belum ada data untuk ditampilkan.'}
            </p>
          </div>
        ) : (
          empty
        )}
      </div>
    )
  }

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
