'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getHistory, clearHistory } from '@/lib/storage'
import type { WatchHistoryItem } from '@/lib/types'

function formatProgress(pos: number, dur: number): string {
  if (!dur) return ''
  const pct = Math.round((pos / dur) * 100)
  const mins = Math.floor(pos / 60000)
  return `${mins} phút · ${pct}%`
}

export default function HistoryPage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([])

  useEffect(() => { setHistory(getHistory()) }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Lịch sử xem</h1>
        {history.length > 0 && (
          <button
            onClick={() => { clearHistory(); setHistory([]) }}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Local storage notice */}
      <p className="text-xs text-gray-600 mb-6 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Lịch sử được lưu trên trình duyệt này và không đồng bộ giữa các thiết bị.
      </p>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-lg">Chưa có lịch sử xem</p>
          <p className="text-gray-600 text-sm mt-2">Bắt đầu xem phim để lưu lịch sử tại đây.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/danh-sach/phim-moi" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
              Xem phim mới
            </Link>
            <Link href="/danh-sach/phim-bo" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
              Phim bộ
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <Link
              key={`${item.movieSlug}-${item.episodeSlug}`}
              href={`/watch/${item.movieSlug}?episode=${item.episodeSlug}`}
              className="flex gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors group"
            >
              <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shrink-0">
                {item.thumbUrl && (
                  <Image src={item.thumbUrl} alt={item.movieName} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">{item.movieName}</p>
                <p className="text-sm text-gray-400 mt-0.5">Tập {item.episodeName}</p>
                {item.durationMs > 0 && (
                  <>
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden w-full max-w-xs">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, (item.positionMs / item.durationMs) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{formatProgress(item.positionMs, item.durationMs)}</p>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
