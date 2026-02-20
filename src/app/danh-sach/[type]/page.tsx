import { getMovieList } from '@/lib/api'
import MovieGrid from '@/components/MovieGrid'
import Pagination from '@/components/Pagination'

const TYPE_LABELS: Record<string, string> = {
  'phim-moi': 'Phim Mới',
  'phim-bo': 'Phim Bộ',
  'phim-le': 'Phim Lẻ',
  'hoat-hinh': 'Hoạt Hình',
  'tv-shows': 'TV Shows',
}

interface Props {
  params: { type: string }
  searchParams: { page?: string }
}

export default async function ListPage({ params, searchParams }: Props) {
  const page = parseInt(searchParams.page || '1', 10)
  const data = await getMovieList(params.type, page).catch(() => ({
    movies: [],
    currentPage: 1,
    totalItems: 0,
    totalItemsPerPage: 24,
  }))

  const label = TYPE_LABELS[params.type] || params.type

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{label}</h1>
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
