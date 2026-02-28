'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RandomButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRandom() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/random')
      const data = await res.json()
      if (data.slug) router.push(`/movie/${data.slug}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRandom}
      disabled={loading}
      title="Xem phim ngẫu nhiên"
      className="shrink-0 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4h4l1.5 1.5M4 20h4l9-9-2.5-2.5M16 4h4v4M20 4l-6.5 6.5M16 20h4v-4" />
          <circle cx="6.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="9.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      )}
    </button>
  )
}
