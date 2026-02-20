'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}

export default function Pagination({ currentPage, totalItems, itemsPerPage }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (totalPages <= 1) return null

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages = buildPages(currentPage, totalPages)

  return (
    <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 rounded bg-white/10 text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
      >
        ← Trước
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-1.5 text-gray-500 text-sm select-none">…</span>
        ) : (
          <button
            key={`page-${p}`}
            onClick={() => goTo(p as number)}
            className={`min-w-[36px] px-3 py-1.5 rounded text-sm transition-colors ${
              p === currentPage
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1.5 rounded bg-white/10 text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
      >
        Sau →
      </button>

      <span className="text-xs text-gray-500 ml-2">
        Trang {currentPage}/{totalPages}
      </span>
    </div>
  )
}
