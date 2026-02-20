import { getMoviesByCategory } from '@/lib/api'
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid'

interface Props {
  params: { slug: string }
}

export default async function CategoryPage({ params }: Props) {
  const data = await getMoviesByCategory(params.slug, 1).catch(() => ({
    movies: [],
    currentPage: 1,
    totalItems: 0,
    totalItemsPerPage: 24,
  }))

  const totalPages = Math.ceil(data.totalItems / data.totalItemsPerPage)
  const label = params.slug.replace(/-/g, ' ')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 capitalize">{label}</h1>
      {data.totalItems > 0 && (
        <p className="text-sm text-gray-400 mb-6">{data.totalItems.toLocaleString()} phim</p>
      )}
      <InfiniteMovieGrid
        initialMovies={data.movies}
        initialPage={1}
        totalPages={totalPages}
        fetchUrl={`/api/movies?category=${params.slug}`}
      />
    </div>
  )
}
