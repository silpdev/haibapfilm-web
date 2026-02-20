'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { Category, Country } from '@/lib/types'

const SORT_OPTIONS = [
  { value: 'modified.time', label: 'Mới nhất' },
  { value: 'view', label: 'Xem nhiều' },
  { value: 'year', label: 'Năm' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i)

interface Props {
  categories: Category[]
  countries: Country[]
  currentSort: string
  currentCategory: string
  currentCountry: string
  currentYear: string
}

export default function FilterBar({
  categories, countries,
  currentSort, currentCategory, currentCountry, currentYear,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const clearAll = useCallback(() => {
    const params = new URLSearchParams()
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const activeCount = [currentCategory, currentCountry, currentYear].filter(Boolean).length

  return (
    <div className="space-y-3 mb-6">
      {/* Genre chips row */}
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">Thể loại</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => update('category', '')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !currentCategory
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => update('category', currentCategory === cat.slug ? '' : cat.slug)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Second row: Country + Year + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Country dropdown */}
        <select
          value={currentCountry}
          onChange={e => update('country', e.target.value)}
          className={`text-sm rounded-full px-3 py-1.5 border outline-none cursor-pointer transition-colors appearance-none ${
            currentCountry
              ? 'bg-blue-600/30 border-blue-500/50 text-blue-200'
              : 'bg-white/10 border-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <option value="">🌏 Quốc gia</option>
          {countries.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Year dropdown */}
        <select
          value={currentYear}
          onChange={e => update('year', e.target.value)}
          className={`text-sm rounded-full px-3 py-1.5 border outline-none cursor-pointer transition-colors appearance-none ${
            currentYear
              ? 'bg-green-600/30 border-green-500/50 text-green-200'
              : 'bg-white/10 border-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <option value="">📅 Năm</option>
          {YEARS.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>

        {/* Clear filters */}
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xóa bộ lọc
          </button>
        )}

        {/* Sort — push to the right */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500 shrink-0">Sắp xếp:</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update('sort', opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                currentSort === opt.value
                  ? 'bg-purple-600 text-white font-medium'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter tags */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-500">Đang lọc:</span>
          {currentCategory && (
            <button
              onClick={() => update('category', '')}
              className="flex items-center gap-1 bg-purple-600/25 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full hover:bg-purple-600/40 transition-colors"
            >
              {categories.find(c => c.slug === currentCategory)?.name ?? currentCategory}
              <span className="text-purple-400">×</span>
            </button>
          )}
          {currentCountry && (
            <button
              onClick={() => update('country', '')}
              className="flex items-center gap-1 bg-blue-600/25 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full hover:bg-blue-600/40 transition-colors"
            >
              {countries.find(c => c.slug === currentCountry)?.name ?? currentCountry}
              <span className="text-blue-400">×</span>
            </button>
          )}
          {currentYear && (
            <button
              onClick={() => update('year', '')}
              className="flex items-center gap-1 bg-green-600/25 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full hover:bg-green-600/40 transition-colors"
            >
              {currentYear}
              <span className="text-green-400">×</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
