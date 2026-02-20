'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-purple-400 shrink-0">
          HaiBapFilm
        </Link>

        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
          <Link href="/danh-sach/phim-moi" className="hover:text-white transition-colors">Phim Mới</Link>
          <Link href="/danh-sach/phim-bo" className="hover:text-white transition-colors">Phim Bộ</Link>
          <Link href="/danh-sach/phim-le" className="hover:text-white transition-colors">Phim Lẻ</Link>
          <Link href="/danh-sach/hoat-hinh" className="hover:text-white transition-colors">Hoạt Hình</Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 flex justify-end">
          <div className="relative w-full max-w-xs">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm phim..."
              className="w-full bg-white/10 text-sm rounded-full px-4 py-1.5 pr-10 outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <Link href="/history" className="shrink-0 text-gray-400 hover:text-white transition-colors" title="Lịch sử xem">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>
        <Link href="/favorites" className="shrink-0 text-gray-400 hover:text-white transition-colors" title="Yêu thích">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </Link>
      </div>
    </nav>
  )
}
