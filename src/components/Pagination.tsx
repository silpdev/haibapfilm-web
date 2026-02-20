'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
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
  }

  const pages: (number | '...')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex justify-center gap-2 mt-8 flex-wrap">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 rounded bg-white/10 text-sm disabled:opacity-30 hover:bg-white/20 transition-colors"
      >
        ← Trước
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-3 py-1.5 text-gray-500">…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              p === currentPage
                ? 'bg-purple-600 text-white'
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
    </div>
  )
}
