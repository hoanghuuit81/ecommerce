import type { PaginationMeta } from '../types/catalog'

export function Pagination({ meta, onPageChange }: { meta: PaginationMeta | null; onPageChange: (page: number) => void }) {
  if (!meta || meta.last_page < 2) {
    return null
  }

  return (
    <div className="pager">
      <button type="button" disabled={meta.current_page === 1} onClick={() => onPageChange(meta.current_page - 1)}>←</button>
      <span>Trang {meta.current_page} / {meta.last_page}</span>
      <button type="button" disabled={meta.current_page === meta.last_page} onClick={() => onPageChange(meta.current_page + 1)}>→</button>
    </div>
  )
}
