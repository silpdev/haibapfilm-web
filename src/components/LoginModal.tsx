'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: Props) {
  const { signInWithGoogle, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setEmail(''); setEmailSent(false); setError(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true); setError(null)
    const { error: err } = await signInWithEmail(email.trim())
    setSending(false)
    if (err) setError(err)
    else setEmailSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Đồng bộ dữ liệu</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Đóng">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-5">
          Đăng nhập để lịch sử xem, yêu thích và tiến trình tự động đồng bộ trên tất cả thiết bị.
        </p>

        {/* Google */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium rounded-xl py-2.5 hover:bg-gray-100 transition-colors mb-4"
        >
          {/* Google "G" logo */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Đăng nhập với Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">hoặc</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email magic link */}
        {emailSent ? (
          <div className="text-center py-2">
            <p className="text-purple-400 font-medium mb-1">Kiểm tra email của bạn ✉️</p>
            <p className="text-sm text-gray-400">Chúng tôi đã gửi link đăng nhập đến <span className="text-white">{email}</span>.</p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-300 underline"
            >
              Gửi lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmail} className="space-y-3">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ten@example.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-purple-500"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-2.5 text-sm transition-colors"
            >
              {sending ? 'Đang gửi…' : 'Gửi link đăng nhập'}
            </button>
          </form>
        )}

        {/* Guest option */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          Tiếp tục không đăng nhập →
        </button>
      </div>
    </div>
  )
}
