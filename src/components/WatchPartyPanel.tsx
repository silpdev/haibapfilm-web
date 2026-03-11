'use client'

import { useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import type { WatchPartyMember } from '@/hooks/useWatchParty'
import ScheduleWatchPartyModal from '@/components/ScheduleWatchPartyModal'

interface Props {
  user: User | null
  partyCode: string | null
  isHost: boolean
  members: WatchPartyMember[]
  connected: boolean
  hostLeft: boolean
  movieSlug: string
  episodeSlug: string
  serverName: string
  movieTitle: string
  moviePosterUrl: string
  movieDescription: string
  episodeName: string
  onCreateParty: () => Promise<void>
  onJoinParty: (code: string) => Promise<void>
  onLeaveParty: () => void
  onDismissHostLeft: () => void
}

export default function WatchPartyPanel({
  user,
  partyCode,
  isHost,
  members,
  connected,
  hostLeft,
  movieSlug,
  episodeSlug,
  serverName,
  movieTitle,
  moviePosterUrl,
  movieDescription,
  episodeName,
  onCreateParty,
  onJoinParty,
  onLeaveParty,
  onDismissHostLeft,
}: Props) {
  const [isOpen, setIsOpen] = useState(!!partyCode)
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const joinInputRef = useRef<HTMLInputElement>(null)

  const isInParty = !!partyCode

  async function handleCreate() {
    if (!user) return
    setError('')
    setLoading(true)
    try {
      await onCreateParty()
      setIsOpen(true)
    } catch {
      setError('Không thể tạo phòng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) {
      setError('Code phải có 6 ký tự')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onJoinParty(code)
    } catch {
      setError('Phòng không tồn tại hoặc đã hết hạn')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyLink() {
    if (!partyCode) return
    const url = `${window.location.origin}${window.location.pathname}?party=${partyCode}`
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4">
      {showSchedule && (
        <ScheduleWatchPartyModal
          movieSlug={movieSlug}
          episodeSlug={episodeSlug}
          serverName={serverName}
          movieTitle={movieTitle}
          moviePosterUrl={moviePosterUrl}
          movieDescription={movieDescription}
          episodeName={episodeName}
          onScheduled={() => setShowSchedule(false)}
          onClose={() => setShowSchedule(false)}
        />
      )}
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors ${
          isInParty
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-white/10 hover:bg-white/20 text-gray-300'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
        Watch Party
        {isInParty && members.length > 0 && (
          <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs leading-none">
            {members.length}
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="mt-2 bg-zinc-900 border border-white/10 rounded-xl p-4 max-w-sm">

          {/* Not logged in */}
          {!user && (
            <p className="text-sm text-gray-400">
              Đăng nhập để dùng tính năng Watch Party.
            </p>
          )}

          {/* Logged in, not in party */}
          {user && !isInParty && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Xem phim cùng bạn bè
              </p>

              <button
                onClick={() => { setShowSchedule(true); setError('') }}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                </svg>
                Hẹn giờ cùng xem
              </button>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                )}
                Tạo phòng
              </button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500">hoặc</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex gap-2">
                <input
                  ref={joinInputRef}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  placeholder="Nhập code 6 ký tự"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 uppercase tracking-widest"
                  maxLength={6}
                />
                <button
                  onClick={handleJoin}
                  disabled={loading || joinCode.length !== 6}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                >
                  Vào
                </button>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          )}

          {/* In party */}
          {user && isInParty && (
            <div className="space-y-3">
              {/* Host left notification */}
              {hostLeft && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-yellow-400 font-medium">Host đã rời phòng</p>
                  <button
                    onClick={onDismissHostLeft}
                    className="text-xs text-yellow-300 hover:text-white underline"
                  >
                    Tiếp tục tự xem
                  </button>
                </div>
              )}

              {/* Party code + copy */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Mã phòng</p>
                  <span className="text-lg font-mono font-bold tracking-widest text-white">
                    {partyCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Đã copy!
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                      </svg>
                      Copy link
                    </>
                  )}
                </button>
              </div>

              {/* Role indicator */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-400">
                  {connected ? (isHost ? 'Host · Bạn đang điều khiển' : 'Đang đồng bộ với host') : 'Đang kết nối...'}
                </span>
              </div>

              {/* Member list */}
              {members.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Thành viên ({members.length})
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {members
                      .sort((a, b) => (b.isHost ? 1 : 0) - (a.isHost ? 1 : 0))
                      .map(m => (
                        <div key={m.userId} className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center text-xs font-medium text-white shrink-0">
                            {m.displayName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-200 truncate">{m.displayName}</span>
                          {m.isHost && (
                            <span className="ml-auto text-xs text-purple-400 shrink-0">Host</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Leave button */}
              <button
                onClick={onLeaveParty}
                className="w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 py-1.5 px-3 rounded-lg transition-colors"
              >
                {isHost ? 'Kết thúc phòng' : 'Rời phòng'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
