import { getMovieList, getCategories, getCountries } from '@/lib/api'
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid'
import FilterBar from '@/components/FilterBar'

const TYPE_LABELS: Record<string, string> = {
  'phim-moi':   'Phim Mới',
  'phim-bo':    'Phim Bộ',
  'phim-le':    'Phim Lẻ',
  'hoat-hinh':  'Hoạt Hình',
  'tv-shows':   'TV Shows',
}

interface Props {
  params: { type: string }
  searchParams: { sort?: string; category?: string; country?: string; year?: string }
}

export default async function ListPage({ params, searchParams }: Props) {
  const sort     = searchParams.sort     || 'modified.time'
  const category = searchParams.category || ''
  const country  = searchParams.country  || ''
  const year     = searchParams.year     || ''

  const [data, categories, countries] = await Promise.all([
    getMovieList(params.type, 1, { category, country, year }, sort).catch(() => ({
      movies: [], currentPage: 1, totalItems: 0, totalItemsPerPage: 24,
    })),
    getCategories().catch(() => []),
    getCountries().catch(() => []),
  ])

  const label      = TYPE_LABELS[params.type] || params.type
  const totalPages = Math.ceil(data.totalItems / data.totalItemsPerPage)

  // Build the fetch URL — includes all active filters so infinite scroll keeps them
  const fetchParams = new URLSearchParams({ type: params.type, sort })
  if (category) fetchParams.set('category', category)
  if (country)  fetchParams.set('country',  country)
  if (year)     fetchParams.set('year',      year)
  const fetchUrl = `/api/movies?${fetchParams.toString()}`

  // Key resets InfiniteMovieGrid whenever filters change
  const gridKey = `${params.type}-${sort}-${category}-${country}-${year}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{label}</h1>
          {data.totalItems > 0 && (
            <p className="text-sm text-gray-400 mt-1">{data.totalItems.toLocaleString()} phim</p>
          )}
        </div>
      </div>

      <FilterBar
        categories={categories}
        countries={countries}
        currentSort={sort}
        currentCategory={category}
        currentCountry={country}
        currentYear={year}
      />

      <InfiniteMovieGrid
        key={gridKey}
        initialMovies={data.movies}
        initialPage={1}
        totalPages={totalPages}
        fetchUrl={fetchUrl}
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
