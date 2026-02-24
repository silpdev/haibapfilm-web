'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getFavorites } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'
import type { Favorite } from '@/lib/types'

export default function FavoritesPage() {
  const [favs, setFavs] = useState<Favorite[]>([])
  const { user } = useAuth()

  useEffect(() => { setFavs(getFavorites()) }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Phim yêu thích</h1>

      {/* Show sync status — hide localStorage-only warning when signed in */}
      {user ? (
        <p className="text-xs text-green-500 mb-6 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Yêu thích đang được đồng bộ với tài khoản của bạn.
        </p>
      ) : (
        <p className="text-xs text-gray-600 mb-6 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Danh sách yêu thích được lưu trên trình duyệt này và không đồng bộ giữa các thiết bị.
        </p>
      )}

      {favs.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-400 text-lg">Chưa có phim yêu thích</p>
          <p className="text-gray-600 text-sm mt-2">Nhấn ❤️ trên trang phim để lưu vào đây.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
              Khám phá phim
            </Link>
            <Link href="/danh-sach/phim-moi" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
              Phim mới nhất
            </Link>
          </div>
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
