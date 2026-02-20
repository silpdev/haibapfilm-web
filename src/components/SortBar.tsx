'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'modified.time', label: 'Mới nhất' },
  { value: 'view', label: 'Xem nhiều nhất' },
  { value: 'year', label: 'Năm phát hành' },
]

export default function SortBar({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function changeSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 shrink-0">Sắp xếp:</span>
      <div className="flex gap-1">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => changeSort(opt.value)}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentSort === opt.value
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
