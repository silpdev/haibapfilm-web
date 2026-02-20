'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getFavorites } from '@/lib/storage'
import type { Favorite } from '@/lib/types'

export default function FavoritesPage() {
  const [favs, setFavs] = useState<Favorite[]>([])

  useEffect(() => { setFavs(getFavorites()) }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Phim yêu thích</h1>

      {favs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p>Chưa có phim yêu thích</p>
          <Link href="/" className="text-purple-400 hover:underline mt-3 inline-block text-sm">Khám phá phim →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {favs.map(fav => (
            <Link key={fav.movieSlug} href={`/movie/${fav.movieSlug}`} className="group block">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                {fav.thumbUrl && (
                  <Image
                    src={fav.thumbUrl}
                    alt={fav.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-purple-600 rounded-full p-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-100 truncate group-hover:text-purple-400 transition-colors">{fav.name}</p>
                <p className="text-xs text-gray-500">{fav.year}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
