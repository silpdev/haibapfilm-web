import { searchMovies } from '@/lib/api'
import MovieGrid from '@/components/MovieGrid'
import Pagination from '@/components/Pagination'
import { Suspense } from 'react'

interface Props {
  searchParams: { q?: string; page?: string }
}

async function Results({ q, page }: { q: string; page: number }) {
  const data = await searchMovies(q, page).catch(() => ({ movies: [], currentPage: 1, totalItems: 0, totalItemsPerPage: 24 }))
  return (
    <>
      <p className="text-sm text-gray-400 mb-6">
        Tìm thấy <span className="text-white font-medium">{data.totalItems}</span> kết quả cho &quot;{q}&quot;
      </p>
      <MovieGrid movies={data.movies} />
      <Pagination currentPage={data.currentPage} totalItems={data.totalItems} itemsPerPage={data.totalItemsPerPage} />
    </>
  )
}

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams.q || ''
  const page = parseInt(searchParams.page || '1', 10)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {q ? `Kết quả: "${q}"` : 'Tìm kiếm phim'}
      </h1>
      {q ? (
        <Suspense fallback={<p className="text-gray-400">Đang tìm...</p>}>
          <Results q={q} page={page} />
        </Suspense>
      ) : (
        <p className="text-gray-400">Nhập tên phim vào ô tìm kiếm phía trên.</p>
      )}
    </div>
  )
}
