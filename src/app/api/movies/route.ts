import { getMovieList, getMoviesByCategory } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  try {
    if (searchParams.has('category') && !searchParams.has('type')) {
      // Pure category page (the-loai)
      const data = await getMoviesByCategory(searchParams.get('category')!, page)
      return NextResponse.json(data)
    }

    const type = searchParams.get('type') || 'phim-moi'
    const sort = searchParams.get('sort') || 'modified.time'
    const filters = {
      category: searchParams.get('category') || '',
      country:  searchParams.get('country')  || '',
      year:     searchParams.get('year')     || '',
    }
    const data = await getMovieList(type, page, filters, sort)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ movies: [], currentPage: page, totalItems: 0, totalItemsPerPage: 24 })
  }
}
