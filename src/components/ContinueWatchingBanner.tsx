'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function ContinueWatchingBanner() {
  const { continueItem, dismissContinueItem } = useAuth()
  if (!continueItem) return null

  const pct = Math.round((continueItem.positionMs / continueItem.durationMs) * 100)
  const watchUrl = `/watch/${continueItem.movieSlug}?tap=${continueItem.episodeSlug}`

  return (
    <div className="mx-4 mb-4 rounded-xl bg-purple-950/80 border border-purple-700/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-purple-400 mb-1">Tiếp tục xem trên thiết bị khác</p>
          <p className="font-semibold text-white truncate">{continueItem.movieName}</p>
          <p className="text-sm text-gray-400">
            {continueItem.episodeName} • {formatTime(continueItem.positionMs)} / {formatTime(continueItem.durationMs)}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2 shrink-0 mt-1">
          <Link
            href={watchUrl}
            onClick={dismissContinueItem}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            ▶ Xem ngay
          </Link>
          <button
            onClick={dismissContinueItem}
            className="px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
