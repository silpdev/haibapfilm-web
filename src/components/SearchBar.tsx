'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1 max-w-xl">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Nhập tên phim, diễn viên, đạo diễn..."
          autoFocus
          className="w-full bg-white/10 text-sm rounded-full px-5 py-3 pr-12 outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          aria-label="Tìm kiếm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shrink-0"
      >
        Tìm kiếm
      </button>
    </form>
  )
}
