import { getMovieDetail, getRelatedMovies } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FavoriteButton from '@/components/FavoriteButton'
import MovieGrid from '@/components/MovieGrid'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const movie = await getMovieDetail(params.slug)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://film.lamphusi.tech'
    const imageUrl = movie.posterUrl || movie.thumbUrl
    const description = movie.content?.slice(0, 160) || `Xem phim ${movie.name} online miễn phí, chất lượng cao, phụ đề tiếng Việt.`
    const keywords = [
      movie.name, movie.originName,
      ...movie.categories.map(c => c.name),
      'xem phim online', 'phim vietsub', 'phim thuyết minh',
    ].filter(Boolean).join(', ')

    return {
      title: `${movie.name} (${movie.year}) - HaiBapFilm`,
      description,
      keywords,
      openGraph: {
        title: movie.name,
        description,
        url: `${siteUrl}/movie/${params.slug}`,
        siteName: 'HaiBapFilm',
        images: imageUrl ? [{ url: imageUrl, width: 300, height: 450, alt: movie.name }] : [],
        type: 'video.movie',
        locale: 'vi_VN',
      },
      twitter: {
        card: 'summary_large_image',
        title: movie.name,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: { canonical: `${siteUrl}/movie/${params.slug}` },
    }
  } catch {
    return { title: 'HaiBapFilm' }
  }
}

function getYouTubeId(url: string): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return m ? m[1] : null
}

export default async function MovieDetailPage({ params }: Props) {
  let movie
  try {
    movie = await getMovieDetail(params.slug)
  } catch {
    notFound()
  }

  const firstServer = movie.episodes[0]
  const firstEp = firstServer?.items[0]
  const trailerVideoId = getYouTubeId(movie.trailerUrl)

  // Fetch related movies from first category
  const relatedMovies = movie.categories[0]
    ? await getRelatedMovies(movie.categories[0].slug, movie.slug)
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
        <span>/</span>
        {movie.categories[0] && (
          <>
            <Link href={`/the-loai/${movie.categories[0].slug}`} className="hover:text-white transition-colors">
              {movie.categories[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-300 truncate max-w-xs">{movie.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-56 shrink-0">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800">
            {movie.posterUrl || movie.thumbUrl ? (
              <Image
                src={movie.posterUrl || movie.thumbUrl}
                alt={movie.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{movie.name}</h1>
            {movie.originName && <p className="text-gray-400 text-sm mt-1 italic">{movie.originName}</p>}
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 text-sm">
            {movie.quality && (
              <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded-full">{movie.quality}</span>
            )}
            {movie.year > 0 && (
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{movie.year}</span>
            )}
            {movie.time && (
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{movie.time}</span>
            )}
            {movie.lang && (
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{movie.lang}</span>
            )}
            {movie.episodeCurrent && (
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{movie.episodeCurrent}</span>
            )}
            {movie.status && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                movie.status === 'completed' ? 'bg-green-600/40 text-green-300' : 'bg-yellow-600/40 text-yellow-300'
              }`}>
                {movie.status === 'completed' ? 'Hoàn thành' : 'Đang chiếu'}
              </span>
            )}
          </div>

          {/* Ratings — only show if > 0 */}
          {(movie.tmdbRating > 0 || movie.imdbRating > 0) && (
            <div className="flex gap-4 text-sm">
              {movie.tmdbRating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  ⭐ TMDB {movie.tmdbRating.toFixed(1)}
                </span>
              )}
              {movie.imdbRating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  ⭐ IMDb {movie.imdbRating.toFixed(1)}
                </span>
              )}
            </div>
          )}

          {/* Categories */}
          {movie.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.categories.map(c => (
                <Link
                  key={c.id}
                  href={`/the-loai/${c.slug}`}
                  className="text-xs bg-white/10 hover:bg-purple-600/50 px-2.5 py-1 rounded-full transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {/* Cast — only show if not empty */}
          {movie.actors.length > 0 && (
            <p className="text-sm text-gray-400">
              <span className="text-gray-200 font-medium">Diễn viên: </span>
              {movie.actors.slice(0, 6).join(', ')}
            </p>
          )}
          {movie.directors.length > 0 && (
            <p className="text-sm text-gray-400">
              <span className="text-gray-200 font-medium">Đạo diễn: </span>
              {movie.directors.join(', ')}
            </p>
          )}

          {/* Description */}
          {movie.content && (
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{movie.content}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap pt-2">
            {firstEp && (
              <Link
                href={`/watch/${movie.slug}?server=0&episode=${firstEp.slug}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Xem ngay
              </Link>
            )}
            <FavoriteButton movie={movie} />
          </div>
        </div>
      </div>

      {/* Trailer */}
      {trailerVideoId && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Trailer</h2>
          <div className="relative aspect-video max-w-2xl rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${trailerVideoId}`}
              title={`${movie.name} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Episodes */}
      {movie.episodes.length > 0 && (
        <div className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold">Danh sách tập</h2>
          {movie.episodes.map((server, si) => (
            <div key={si}>
              <h3 className="text-sm font-medium text-gray-400 mb-3">{server.serverName}</h3>
              <div className="flex flex-wrap gap-2">
                {server.items.map(ep => (
                  <Link
                    key={ep.slug}
                    href={`/watch/${movie.slug}?server=${si}&episode=${ep.slug}`}
                    className="bg-white/10 hover:bg-purple-600 text-sm px-3 py-1.5 rounded transition-colors"
                  >
                    {ep.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Related movies */}
      {relatedMovies.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold mb-5">Phim liên quan</h2>
          <MovieGrid movies={relatedMovies} />
        </div>
      )}

      {/* JSON-LD structured data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Movie',
          name: movie.name,
          alternateName: movie.originName,
          description: movie.content?.slice(0, 300),
          image: movie.posterUrl || movie.thumbUrl,
          dateCreated: movie.year ? String(movie.year) : undefined,
          genre: movie.categories.map(c => c.name),
          actor: movie.actors.slice(0, 5).map(a => ({ '@type': 'Person', name: a })),
          director: movie.directors.map(d => ({ '@type': 'Person', name: d })),
          aggregateRating: movie.tmdbRating > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: movie.tmdbRating,
            ratingCount: 100,
            bestRating: 10,
          } : undefined,
        }) }}
      />
    </div>
  )
}
