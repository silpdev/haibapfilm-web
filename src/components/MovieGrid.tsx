import type { Movie } from '@/lib/types'
import MovieCard from './MovieCard'

interface Props {
  movies: Movie[]
  title?: string
}

export default function MovieGrid({ movies, title }: Props) {
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
    <section>
      {title && <h2 className="text-lg font-semibold text-gray-100 mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map(m => <MovieCard key={m.id || m.slug} movie={m} />)}
      </div>
    </section>
  )
}
