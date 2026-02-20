'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Movie } from '@/lib/types'
import MovieCard from './MovieCard'

interface Props {
  initialMovies: Movie[]
  initialPage: number
  totalPages: number
  fetchUrl: string
}

export default function InfiniteMovieGrid({ initialMovies, initialPage, totalPages, fetchUrl }: Props) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPage < totalPages)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`${fetchUrl}&page=${nextPage}`)
      const data = await res.json()
      setMovies(prev => [...prev, ...data.movies])
      setPage(nextPage)
      const pages = Math.ceil(data.totalItems / data.totalItemsPerPage)
      setHasMore(nextPage < pages)
    } catch {
      // silently ignore network errors
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, fetchUrl])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) fetchMore() },
      { rootMargin: '300px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchMore])

  if (!movies.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        <p>Không tìm thấy phim</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map(m => <MovieCard key={m.id || m.slug} movie={m} />)}
      </div>

      {/* Sentinel — triggers load when scrolled into view */}
      <div ref={sentinelRef} className="mt-10 flex justify-center min-h-[48px]">
        {loading && (
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="animate-spin w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Đang tải thêm...</span>
          </div>
        )}
        {!hasMore && !loading && (
          <p className="text-xs text-gray-600">Đã hiển thị tất cả phim</p>
        )}
      </div>
    </div>
  )
}
