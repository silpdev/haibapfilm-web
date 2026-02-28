import { getMovieDetail } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import ViewTracker from '@/components/ViewTracker'

interface Props {
  params: { slug: string }
  searchParams: { server?: string; episode?: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const movie = await getMovieDetail(params.slug)
    const imageUrl = movie.thumbUrl || movie.posterUrl
    return {
      title: `Xem: ${movie.name} - HaiBapFilm`,
      description: `Xem phim ${movie.name} online miễn phí, chất lượng cao, phụ đề tiếng Việt.`,
      openGraph: {
        title: `Xem: ${movie.name}`,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch {
    return { title: 'HaiBapFilm' }
  }
}

export default async function WatchPage({ params, searchParams }: Props) {
  let movie
  try {
    movie = await getMovieDetail(params.slug)
  } catch {
    notFound()
  }

  if (!movie.episodes.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Không có nguồn phát cho phim này.</p>
        <Link href={`/movie/${movie.slug}`} className="text-purple-400 hover:underline mt-4 inline-block">← Quay lại</Link>
      </div>
    )
  }

  const serverIdx = Math.min(
    parseInt(searchParams.server || '0', 10),
    movie.episodes.length - 1,
  )
  const server = movie.episodes[serverIdx]
  const episodeSlug = searchParams.episode || server.items[0]?.slug || ''
  const episode = server.items.find(e => e.slug === episodeSlug) || server.items[0]
  if (!episode) notFound()

  const currentEpIdx = server.items.findIndex(e => e.slug === episode.slug)
  const prevEp = currentEpIdx > 0 ? server.items[currentEpIdx - 1] : null
  const nextEp = currentEpIdx < server.items.length - 1 ? server.items[currentEpIdx + 1] : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href={`/movie/${movie.slug}`} className="hover:text-white flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {movie.name}
        </Link>
        <span>/</span>
        <span className="text-gray-300">Tập {episode.name}</span>
      </div>

      {/* Player */}
      <VideoPlayer
        movie={movie}
        episode={episode}
        episodeName={episode.name}
        serverName={server.serverName}
      />
      <ViewTracker slug={movie.slug} name={movie.name} thumbUrl={movie.thumbUrl} />

      {/* Title + Prev/Next — directly below player */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">{movie.name}</h1>
          <p className="text-sm text-gray-400">{server.serverName} — Tập {episode.name}</p>
        </div>

        {/* Prev / Next episode */}
        <div className="flex gap-2 shrink-0">
          {prevEp ? (
            <Link
              href={`/watch/${movie.slug}?server=${serverIdx}&episode=${prevEp.slug}`}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-sm px-4 py-2 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tập trước
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 bg-white/5 text-gray-600 text-sm px-4 py-2 rounded-full cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tập trước
            </span>
          )}
          {nextEp ? (
            <Link
              href={`/watch/${movie.slug}?server=${serverIdx}&episode=${nextEp.slug}`}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-full transition-colors"
            >
              Tập sau
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 bg-white/5 text-gray-600 text-sm px-4 py-2 rounded-full cursor-not-allowed">
              Tập sau
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Server & episode selector */}
      <div className="mt-6 space-y-4">
        {movie.episodes.length > 1 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Nguồn phát</p>
            <div className="flex gap-2 flex-wrap">
              {movie.episodes.map((srv, si) => (
                <Link
                  key={si}
                  href={`/watch/${movie.slug}?server=${si}&episode=${srv.items[0]?.slug || ''}`}
                  className={`text-sm px-3 py-1.5 rounded transition-colors ${
                    si === serverIdx ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {srv.serverName}
                </Link>
              ))}
            </div>
          </div>
        )}

        {server.items.length > 1 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Danh sách tập</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {server.items.map(ep => (
                <Link
                  key={ep.slug}
                  href={`/watch/${movie.slug}?server=${serverIdx}&episode=${ep.slug}`}
                  className={`text-sm px-3 py-1.5 rounded transition-colors ${
                    ep.slug === episode.slug ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {ep.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
