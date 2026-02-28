/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Movie, MovieDetail, PaginatedMovies, Category, Country } from './types'

const BASE = 'https://ophim1.com/v1/api'
const FALLBACK_CDN = 'https://img.ophim.live/uploads/movies/'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function img(path: string, cdn?: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // The API's APP_DOMAIN_CDN_IMAGE is a bare domain without the /uploads/movies/
  // sub-path, so we always use the known-good FALLBACK_CDN instead.
  return `${FALLBACK_CDN}${path.replace(/^\//, '')}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMovie(d: any, cdn?: string): Movie {
  return {
    id: d._id || d.id || '',
    name: d.name || '',
    slug: d.slug || '',
    originName: d.origin_name || d.originName || '',
    type: d.type || '',
    thumbUrl: img(d.thumb_url || d.thumbUrl || '', cdn),
    posterUrl: img(d.poster_url || d.posterUrl || '', cdn),
    year: d.year || 0,
    quality: d.quality || '',
    lang: d.lang || '',
    episodeCurrent: d.episode_current || d.episodeCurrent || '',
    time: d.time || '',
    categories: (d.category || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
    countries: (d.country || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
    tmdbRating: d.tmdb?.vote_average || d.tmdb?.voteAverage || 0,
    imdbRating: d.imdb?.vote_average || d.imdb?.voteAverage || 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetail(d: any, cdn?: string): MovieDetail {
  return {
    ...mapMovie(d, cdn),
    content: (d.content || '').replace(/<[^>]*>/g, '').trim(),
    trailerUrl: d.trailer_url || d.trailerUrl || '',
    actors: d.actor || [],
    directors: d.director || [],
    status: d.status || '',
    view: d.view || 0,
    episodeTotal: d.episode_total || d.episodeTotal || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    episodes: (d.episodes || []).map((srv: any) => ({
      serverName: srv.server_name || srv.serverName || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (srv.server_data || srv.items || []).map((ep: any) => ({
        name: ep.name || '',
        slug: ep.slug || '',
        linkEmbed: ep.link_embed || ep.linkEmbed || '',
        linkM3u8: ep.link_m3u8 || ep.linkM3u8 || '',
      })),
    })),
  }
}

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 300 },
    headers: { 'User-Agent': 'HaiBapFilm-Web/1.0' },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function getHome(): Promise<{ sections: { title: string; slug: string; movies: Movie[] }[] }> {
  const json = await get('/home')
  const cdn = json.data?.APP_DOMAIN_CDN_IMAGE || json.data?.params?.cdn_image || FALLBACK_CDN
  const items: Movie[] = (json.data?.items || []).map((d: any) => mapMovie(d, cdn))
  return { sections: [{ title: 'Phim Mới', slug: 'phim-moi', movies: items }] }
}

export async function getMovieList(
  type = 'phim-moi',
  page = 1,
  filters: { category?: string; country?: string; year?: string } = {},
  sortField = 'modified.time',
): Promise<PaginatedMovies> {
  const params = new URLSearchParams({
    page: String(page),
    limit: '24',
    sort_field: sortField,
    category: filters.category || '',
    country: filters.country || '',
    year: filters.year || '',
  })
  const json = await get(`/danh-sach/${type}?${params}`)
  const cdn = json.data?.APP_DOMAIN_CDN_IMAGE || FALLBACK_CDN
  return {
    movies: (json.data?.items || []).map((d: any) => mapMovie(d, cdn)),
    currentPage: json.data?.params?.pagination?.currentPage || page,
    totalItems: json.data?.params?.pagination?.totalItems || 0,
    totalItemsPerPage: json.data?.params?.pagination?.totalItemsPerPage || 24,
  }
}

export async function searchMovies(
  keyword: string,
  page = 1,
  filters: { category?: string; country?: string; year?: string } = {},
): Promise<PaginatedMovies> {
  const params = new URLSearchParams({ keyword, page: String(page), limit: '24' })
  if (filters.category) params.set('category', filters.category)
  if (filters.country) params.set('country', filters.country)
  if (filters.year) params.set('year', filters.year)
  const json = await get(`/tim-kiem?${params}`)
  const cdn = json.data?.APP_DOMAIN_CDN_IMAGE || FALLBACK_CDN
  return {
    movies: (json.data?.items || []).map((d: any) => mapMovie(d, cdn)),
    currentPage: json.data?.params?.pagination?.currentPage || page,
    totalItems: json.data?.params?.pagination?.totalItems || 0,
    totalItemsPerPage: json.data?.params?.pagination?.totalItemsPerPage || 24,
  }
}

export async function getMovieDetail(slug: string): Promise<MovieDetail> {
  const json = await get(`/phim/${slug}`)
  const cdn = json.data?.APP_DOMAIN_CDN_IMAGE || FALLBACK_CDN
  return mapDetail(json.data?.item || json.data, cdn)
}

export async function getCategories(): Promise<Category[]> {
  const json = await get('/the-loai')
  return (json.data?.items || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
}

export async function getCountries(): Promise<Country[]> {
  const json = await get('/quoc-gia')
  return (json.data?.items || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
}

export async function getMoviesByCategory(slug: string, page = 1): Promise<PaginatedMovies> {
  const params = new URLSearchParams({ page: String(page), limit: '24' })
  const json = await get(`/the-loai/${slug}?${params}`)
  const cdn = json.data?.APP_DOMAIN_CDN_IMAGE || FALLBACK_CDN
  return {
    movies: (json.data?.items || []).map((d: any) => mapMovie(d, cdn)),
    currentPage: json.data?.params?.pagination?.currentPage || page,
    totalItems: json.data?.params?.pagination?.totalItems || 0,
    totalItemsPerPage: json.data?.params?.pagination?.totalItemsPerPage || 24,
  }
}

export async function getRelatedMovies(categorySlug: string, excludeSlug: string): Promise<Movie[]> {
  try {
    const data = await getMoviesByCategory(categorySlug, 1)
    return data.movies.filter(m => m.slug !== excludeSlug).slice(0, 12)
  } catch {
    return []
  }
}

export async function getHomeMultiSection(): Promise<{
  newest: Movie[]
  series: Movie[]
  anime: Movie[]
  featured: Movie | null
}> {
  const [newData, seriesData, animeData] = await Promise.all([
    getMovieList('phim-moi', 1).catch(() => ({ movies: [] as Movie[] })),
    getMovieList('phim-bo', 1).catch(() => ({ movies: [] as Movie[] })),
    getMovieList('hoat-hinh', 1).catch(() => ({ movies: [] as Movie[] })),
  ])
  const featured = newData.movies.find(m => m.posterUrl || m.thumbUrl) || newData.movies[0] || null
  return { newest: newData.movies, series: seriesData.movies, anime: animeData.movies, featured }
}
