import { getMovieList } from '@/lib/api'
import MovieGrid from '@/components/MovieGrid'
import Pagination from '@/components/Pagination'
import SortBar from '@/components/SortBar'

const TYPE_LABELS: Record<string, string> = {
  'phim-moi': 'Phim Mới',
  'phim-bo': 'Phim Bộ',
  'phim-le': 'Phim Lẻ',
  'hoat-hinh': 'Hoạt Hình',
  'tv-shows': 'TV Shows',
}

interface Props {
  params: { type: string }
  searchParams: { page?: string; sort?: string }
}

export default async function ListPage({ params, searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const sort = searchParams.sort || 'modified.time'

  const data = await getMovieList(params.type, page, {}, sort).catch(() => ({
    movies: [],
    currentPage: 1,
    totalItems: 0,
    totalItemsPerPage: 24,
  }))

  const label = TYPE_LABELS[params.type] || params.type

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{label}</h1>
          {data.totalItems > 0 && (
            <p className="text-sm text-gray-400 mt-1">{data.totalItems.toLocaleString()} phim</p>
          )}
        </div>
        <SortBar currentSort={sort} />
      </div>

      <MovieGrid movies={data.movies} />
      <Pagination
        currentPage={data.currentPage}
        totalItems={data.totalItems}
        itemsPerPage={data.totalItemsPerPage}
      />
    </div>
  )
}

export function generateStaticParams() {
  return [
    { type: 'phim-moi' },
    { type: 'phim-bo' },
    { type: 'phim-le' },
    { type: 'hoat-hinh' },
    { type: 'tv-shows' },
  ]
}
