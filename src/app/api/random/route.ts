import { NextResponse } from 'next/server'
import { getMovieList } from '@/lib/api'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'phim-moi'

    // Fetch page 1 to find total pages
    const first = await getMovieList(type, 1)
    const totalPages = Math.max(1, Math.ceil(first.totalItems / first.totalItemsPerPage))
    const maxPage = Math.min(totalPages, 50)
    const randomPage = Math.floor(Math.random() * maxPage) + 1

    let movies = first.movies
    if (randomPage > 1) {
      const data = await getMovieList(type, randomPage)
      movies = data.movies
    }

    if (!movies.length) {
      return NextResponse.json({ error: 'No movies found' }, { status: 404 })
    }

    const movie = movies[Math.floor(Math.random() * movies.length)]
    return NextResponse.json({ slug: movie.slug, name: movie.name })
  } catch {
    return NextResponse.json({ error: 'Failed to get random movie' }, { status: 500 })
  }
}
