'use client'

import { useEffect, useState } from 'react'
import { isFavorite, toggleFavorite } from '@/lib/storage'
import type { Movie } from '@/lib/types'

export default function FavoriteButton({ movie }: { movie: Movie }) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    setFav(isFavorite(movie.slug))
  }, [movie.slug])

  function toggle() {
    const next = toggleFavorite({
      movieSlug: movie.slug,
      name: movie.name,
      thumbUrl: movie.thumbUrl,
      year: movie.year,
      episodeCurrent: movie.episodeCurrent,
      addedAt: Date.now(),
    })
    setFav(next)
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        fav ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
      }`}
    >
      <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {fav ? 'Đã yêu thích' : 'Yêu thích'}
    </button>
  )
}
