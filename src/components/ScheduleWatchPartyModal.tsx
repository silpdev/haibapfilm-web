'use client'

import { useState, useRef } from 'react'

interface Props {
  movieSlug: string
  episodeSlug: string
  serverName: string
  movieTitle: string
  moviePosterUrl: string
  movieDescription: string
  episodeName: string
  onScheduled: (code: string, scheduledFor: string) => void
  onClose: () => void
}

const DURATIONS = [
  { label: '1 giờ',       value: 60 },
  { label: '1 giờ 30 phút', value: 90 },
  { label: '2 giờ',       value: 120 },
  { label: '2 giờ 30 phút', value: 150 },
  { label: '3 giờ',       value: 180 },
]

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
}

// Min date = today in VN local (YYYY-MM-DD)
function todayLocal() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

// Default time = next full hour
function defaultTime() {
  const d = new Date(Date.now() + 3600000)
  return `${String(d.getHours()).padStart(2, '0')}:00`
}

export default function ScheduleWatchPartyModal({
  movieSlug, episodeSlug, serverName,
  movieTitle, moviePosterUrl, movieDescription, episodeName,
  onScheduled, onClose,
}: Props) {
  const [date, setDate]         = useState(todayLocal())
  const [time, setTime]         = useState(defaultTime())
  const [duration, setDuration] = useState(120)
  const [emails, setEmails]     = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState<{ code: string; scheduledFor: string } | null>(null)

  const emailInputRef = useRef<HTMLInputElement>(null)

  function addEmail() {
    const trimmed = emailInput.trim().toLowerCase()
    if (!isValidEmail(trimmed)) { setError('Email không hợp lệ'); return }
    if (emails.includes(trimmed)) { setError('Email đã được thêm'); return }
    if (emails.length >= 20) { setError('Tối đa 20 người được mời'); return }
    setEmails(prev => [...prev, trimmed])
    setEmailInput('')
    setError('')
    emailInputRef.current?.focus()
  }

  function removeEmail(email: string) {
    setEmails(prev => prev.filter(e => e !== email))
  }

  async function handleSubmit() {
    setError('')
    if (!date || !time) { setError('Chọn ngày và giờ'); return }
    if (emails.length === 0) { setError('Thêm ít nhất 1 email'); return }

    // Build UTC ISO from local VN input
    // date = "YYYY-MM-DD", time = "HH:MM" in VN time (UTC+7)
    const localIso = `${date}T${time}:00+07:00`
    const scheduledDate = new Date(localIso)
    if (scheduledDate.getTime() < Date.now() + 60000) {
      setError('Thời gian phải ít nhất 1 phút trong tương lai')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/party/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieSlug,
          episodeSlug,
          serverName,
          movieTitle,
          moviePosterUrl,
          movieDescription,
          episodeName,
          scheduledFor:    scheduledDate.toISOString(),
          durationMinutes: duration,
          guestEmails:     emails,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Lỗi không xác định'); return }
      if (data.emailError) { setError(`Phòng đã tạo (${data.code}) nhưng gửi email thất bại: ${data.emailError}`); return }
      setSuccess({ code: data.code, scheduledFor: data.scheduledFor })
      onScheduled(data.code, data.scheduledFor)
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-base font-semibold text-white">Hẹn giờ cùng xem phim</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[280px]">{movieTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Đã gửi lời mời!</p>
              <p className="text-gray-400 text-sm mt-1">
                {emails.length} email đã được gửi kèm file lịch .ics
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Mã phòng</p>
              <p className="text-3xl font-mono font-bold tracking-widest text-purple-400">
                {success.code}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(success.scheduledFor).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                  weekday: 'short', month: 'numeric', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* Form */
          <div className="p-5 space-y-4">

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ngày</label>
                <input
                  type="date"
                  value={date}
                  min={todayLocal()}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Giờ (VN)</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Thời lượng dự kiến</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      duration === d.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email inputs */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Email người được mời ({emails.length}/20)
              </label>
              <div className="flex gap-2">
                <input
                  ref={emailInputRef}
                  type="email"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail() } }}
                  placeholder="ten@example.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={addEmail}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded-lg transition-colors shrink-0"
                >
                  Thêm
                </button>
              </div>

              {/* Email chips */}
              {emails.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {emails.map(email => (
                    <span
                      key={email}
                      className="flex items-center gap-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-2.5 py-1 rounded-full"
                    >
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="text-purple-400 hover:text-white ml-0.5"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || emails.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              )}
              {loading ? 'Đang gửi...' : `Gửi lời mời (${emails.length} người)`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
