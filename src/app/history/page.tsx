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
  return `${mins} phút (${pct}%)`
}

export default function HistoryPage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([])

  useEffect(() => { setHistory(getHistory()) }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
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

      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Chưa có lịch sử xem</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <Link
              key={`${item.movieSlug}-${item.episodeSlug}`}
              href={`/watch/${item.movieSlug}?episode=${item.episodeSlug}`}
              className="flex gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors"
            >
              <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shrink-0">
                {item.thumbUrl && (
                  <Image src={item.thumbUrl} alt={item.movieName} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{item.movieName}</p>
                <p className="text-sm text-gray-400">Tập {item.episodeName}</p>
                {item.durationMs > 0 && (
                  <>
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, (item.positionMs / item.durationMs) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatProgress(item.positionMs, item.durationMs)}</p>
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
