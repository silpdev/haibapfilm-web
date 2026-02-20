import { searchMovies } from '@/lib/api'
import MovieGrid from '@/components/MovieGrid'
import Pagination from '@/components/Pagination'
import SearchBar from '@/components/SearchBar'
import { Suspense } from 'react'

interface Props {
  searchParams: { q?: string; page?: string }
}

async function Results({ q, page }: { q: string; page: number }) {
  const data = await searchMovies(q, page).catch(() => ({
    movies: [],
    currentPage: 1,
    totalItems: 0,
    totalItemsPerPage: 24,
  }))

  if (data.totalItems === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg">Không tìm thấy phim nào cho &quot;{q}&quot;</p>
        <p className="text-sm mt-2">Thử tìm với từ khóa khác hoặc kiểm tra chính tả.</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-gray-400 mb-6">
        Tìm thấy <span className="text-white font-medium">{data.totalItems.toLocaleString()}</span> kết quả cho &quot;{q}&quot;
      </p>
      <MovieGrid movies={data.movies} />
      <Pagination currentPage={data.currentPage} totalItems={data.totalItems} itemsPerPage={data.totalItemsPerPage} />
    </>
  )
}

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams.q || ''
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tìm kiếm phim</h1>

      {/* Search input always visible on this page */}
      <div className="mb-8">
        <SearchBar defaultValue={q} />
      </div>

      {q ? (
        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        }>
          <Results q={q} page={page} />
        </Suspense>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Nhập từ khóa để tìm phim</p>
        </div>
      )}
    </div>
  )
}
