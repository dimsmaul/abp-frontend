import { Skeleton } from '@/components/ui/skeleton'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'

type Props = {
  rows?: number
  columns: number | (string | undefined)[] // number => default widths; array => per-col tailwind width class
}

export function TableSkeleton({ rows = 6, columns }: Props) {
  const cols =
    typeof columns === 'number'
      ? Array.from({ length: columns }, () => undefined as string | undefined)
      : columns

  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {cols.map((w, c) => (
            <TableCell key={c}>
              <Skeleton className={`h-4 ${w ?? 'w-3/4'}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
