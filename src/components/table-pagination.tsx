import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

type Props = {
  page: number
  totalPages: number
  total?: number
  limit?: number
  onPageChange: (page: number) => void
}

function buildPages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('ellipsis')
  pages.push(total)
  return pages
}

export function TablePagination({ page, totalPages, total, limit, onPageChange }: Props) {
  if (!total || total < 1) return null
  const tp = Math.max(1, totalPages || 1)
  const pages = buildPages(page, tp)
  const from = limit ? (page - 1) * limit + 1 : 0
  const to = limit ? Math.min(page * limit, total) : 0

  return (
    <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
      <div className="text-muted-foreground text-xs">
        Menampilkan <span className="font-medium text-foreground">{from}–{to}</span> dari{' '}
        <span className="font-medium text-foreground">{total ?? 0}</span>
      </div>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={page <= 1}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              onClick={(e) => {
                e.preventDefault()
                if (page > 1) onPageChange(page - 1)
              }}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={page >= tp}
              className={page >= tp ? 'pointer-events-none opacity-50' : ''}
              onClick={(e) => {
                e.preventDefault()
                if (page < tp) onPageChange(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
