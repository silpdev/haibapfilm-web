'use client'

import { useEffect } from 'react'

interface Props {
  slug: string
  name: string
  thumbUrl: string
}

// Fires once per session per movie slug — increments trending view count
export default function ViewTracker({ slug, name, thumbUrl }: Props) {
  useEffect(() => {
    const key = `vt_${slug}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name, thumbUrl }),
    }).catch(() => {})
  }, [slug, name, thumbUrl])

  return null
}
