import { getMovieDetail } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'

interface Props {
  params: { slug: string }
  searchParams: { server?: string; episode?: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const movie = await getMovieDetail(params.slug)
    return { title: `Xem: ${movie.name} - HaiBapFilm` }
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

  const serverIdx = parseInt(searchParams.server || '0', 10)
  const server = movie.episodes[Math.min(serverIdx, movie.episodes.length - 1)]
  const episodeSlug = searchParams.episode || server.items[0]?.slug || ''
  const episode = server.items.find(e => e.slug === episodeSlug) || server.items[0]

  if (!episode) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link href={`/movie/${movie.slug}`} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {movie.name}
      </Link>

      {/* Player */}
      <VideoPlayer
        movie={movie}
        episode={episode}
        episodeName={episode.name}
        serverName={server.serverName}
      />

      {/* Title */}
      <div className="mt-4">
        <h1 className="text-lg font-semibold text-white">{movie.name}</h1>
        <p className="text-sm text-gray-400">{server.serverName} — Tập {episode.name}</p>
      </div>

      {/* Server & episode selector */}
      <div className="mt-6 space-y-4">
        {/* Server tabs */}
        {movie.episodes.length > 1 && (
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
        )}

        {/* Episode list */}
        {server.items.length > 1 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Danh sách tập</p>
            <div className="flex flex-wrap gap-2">
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
