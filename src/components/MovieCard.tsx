import Link from 'next/link'
import Image from 'next/image'
import type { Movie } from '@/lib/types'

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movie/${movie.slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
        {movie.thumbUrl ? (
          <Image
            src={movie.thumbUrl}
            alt={movie.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {movie.quality && (
            <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {movie.quality}
            </span>
          )}
          {movie.lang && (
            <span className="bg-black/70 text-gray-200 text-[10px] px-1.5 py-0.5 rounded">
              {movie.lang}
            </span>
          )}
        </div>

        {movie.episodeCurrent && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
            <span className="text-[10px] text-gray-300">{movie.episodeCurrent}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-purple-600 rounded-full p-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-gray-100 truncate group-hover:text-purple-400 transition-colors">
          {movie.name}
        </p>
        <p className="text-xs text-gray-500 truncate">{movie.originName || String(movie.year)}</p>
      </div>
    </Link>
  )
}
