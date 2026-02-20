'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Phim Mới', href: '/danh-sach/phim-moi' },
  { label: 'Phim Bộ', href: '/danh-sach/phim-bo' },
  { label: 'Phim Lẻ', href: '/danh-sach/phim-le' },
  { label: 'Hoạt Hình', href: '/danh-sach/hoat-hinh' },
  { label: 'TV Shows', href: '/danh-sach/tv-shows' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setMenuOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-purple-400 shrink-0 mr-2">
          🎬 HaiBapFilm
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  active
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Search bar — always visible */}
        <form onSubmit={handleSearch} className="flex-1 flex justify-center md:justify-end">
          <div className="relative w-full max-w-xs">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm phim..."
              className="w-full bg-white/10 text-sm rounded-full px-4 py-1.5 pr-10 outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Tìm kiếm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* History & Favorites with text labels on md+ */}
        <Link
          href="/history"
          className={`shrink-0 flex items-center gap-1.5 text-sm transition-colors px-2 py-1.5 rounded-full ${
            pathname === '/history' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
          }`}
          title="Lịch sử xem"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden lg:inline">Lịch sử</span>
        </Link>

        <Link
          href="/favorites"
          className={`shrink-0 flex items-center gap-1.5 text-sm transition-colors px-2 py-1.5 rounded-full ${
            pathname === '/favorites' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
          }`}
          title="Yêu thích"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="hidden lg:inline">Yêu thích</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden shrink-0 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0f0f0f] px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
