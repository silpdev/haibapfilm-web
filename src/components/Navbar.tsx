'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import LoginModal from '@/components/LoginModal'
import RandomButton from '@/components/RandomButton'

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
  const [loginOpen, setLoginOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setMenuOpen(false)
    }
  }

  // Avatar initial or Google photo
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''
  const initial = displayName.charAt(0).toUpperCase() || '?'

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur border-b border-black/10 dark:border-white/10">
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

          {/* Search bar */}
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

          {/* History */}
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

          {/* Favorites */}
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

          {/* Random movie */}
          <RandomButton />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="shrink-0 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* ── Auth button ───────────────────────────────────────────────── */}
          {user ? (
            // Signed in — avatar + dropdown
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-purple-500 transition-all"
                title={displayName}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {initial}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs text-green-400 mt-0.5">✓ Đã đồng bộ</p>
                  </div>
                  <button
                    onClick={() => { signOut(); setDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Signed out — sync icon
            <button
              onClick={() => setLoginOpen(true)}
              className="shrink-0 text-gray-400 hover:text-purple-400 transition-colors"
              title="Đồng bộ tài khoản"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

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
            {!user && (
              <button
                onClick={() => { setMenuOpen(false); setLoginOpen(true) }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-white/10 transition-colors"
              >
                ⟳ Đồng bộ tài khoản
              </button>
            )}
          </div>
        )}
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
