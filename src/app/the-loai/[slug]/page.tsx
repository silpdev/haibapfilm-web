import { getMoviesByCategory } from '@/lib/api'
import MovieGrid from '@/components/MovieGrid'
import Pagination from '@/components/Pagination'

interface Props {
  params: { slug: string }
  searchParams: { page?: string }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const page = parseInt(searchParams.page || '1', 10)
  const data = await getMoviesByCategory(params.slug, page).catch(() => ({
    movies: [],
    currentPage: 1,
    totalItems: 0,
    totalItemsPerPage: 24,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">{params.slug.replace(/-/g, ' ')}</h1>
      <MovieGrid movies={data.movies} />
      <Pagination currentPage={data.currentPage} totalItems={data.totalItems} itemsPerPage={data.totalItemsPerPage} />
    </div>
  )
}
