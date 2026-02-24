'use client'

import type { WatchHistoryItem, Favorite } from './types'
import { pushProgress, pushFavoriteAdded, pushFavoriteRemoved, pushHistory } from './syncStorage'
import { getSupabase } from './supabase'

const HISTORY_KEY   = 'watch_history'
const FAVORITES_KEY = 'favorites'
const PROGRESS_KEY  = 'watch_progress'

// Fire-and-forget: get current userId then call the push fn.
async function withUserId(fn: (uid: string) => Promise<void>) {
  try {
    const { data } = await getSupabase().auth.getSession()
    const uid = data.session?.user?.id
    if (uid) await fn(uid)
  } catch {}
}

// ── Watch History ──────────────────────────────────────────────────────────

export function getHistory(): WatchHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function addHistory(item: WatchHistoryItem) {
  const list = getHistory().filter(
    h => !(h.movieSlug === item.movieSlug && h.episodeSlug === item.episodeSlug)
  )
  list.unshift(item)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 100)))
  // Mirror to Supabase (fire-and-forget)
  withUserId(uid => pushHistory(uid, item))
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

// ── Favorites ──────────────────────────────────────────────────────────────

export function getFavorites(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

export function isFavorite(slug: string): boolean {
  return getFavorites().some(f => f.movieSlug === slug)
}

export function toggleFavorite(fav: Favorite): boolean {
  const list = getFavorites()
  const idx = list.findIndex(f => f.movieSlug === fav.movieSlug)
  if (idx >= 0) {
    list.splice(idx, 1)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
    withUserId(uid => pushFavoriteRemoved(uid, fav.movieSlug))
    return false
  } else {
    list.unshift(fav)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
    withUserId(uid => pushFavoriteAdded(uid, fav))
    return true
  }
}

// ── Watch Progress ─────────────────────────────────────────────────────────

interface Progress {
  positionMs: number
  durationMs: number
  episodeSlug: string
  updatedAt: number
  serverName?: string
}

export function saveProgress(
  movieSlug: string,
  episodeSlug: string,
  positionMs: number,
  durationMs: number,
) {
  try {
    const updatedAt = Date.now()
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    all[movieSlug] = { positionMs, durationMs, episodeSlug, updatedAt }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
    // Mirror to Supabase (fire-and-forget)
    withUserId(uid => pushProgress(uid, movieSlug, episodeSlug, positionMs, durationMs, updatedAt))
  } catch {}
}

export function getProgress(movieSlug: string): Progress | null {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    return all[movieSlug] || null
  } catch {
    return null
  }
}
