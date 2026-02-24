/**
 * syncStorage.ts
 * Handles one-time merge on login (local localStorage ↔ Supabase)
 * and fire-and-forget push after every local write.
 * All Supabase errors are swallowed — localStorage is always written first.
 */

import { getSupabase } from '@/lib/supabase'
import type { WatchHistoryItem, Favorite } from '@/lib/types'

// ── Remote row shapes (match Supabase table column names) ──────────────────

interface RProgress {
  user_id: string; movie_slug: string; episode_slug: string
  server_name: string; position_ms: number; duration_ms: number; updated_at: number
}
interface RFavorite {
  user_id: string; movie_slug: string; name: string; thumb_url: string
  poster_url: string; year: number; added_at: number; episode_count: string
  deleted_at: number | null
}
interface RHistory {
  user_id: string; movie_slug: string; episode_slug: string
  movie_name: string; episode_name: string; thumb_url: string
  position_ms: number; duration_ms: number; watched_at: number; category_slugs: string
}

// ── Local storage key helpers ──────────────────────────────────────────────

function getLocalProgress(): Record<string, { positionMs: number; durationMs: number; episodeSlug: string; updatedAt: number; serverName?: string }> {
  try { return JSON.parse(localStorage.getItem('watch_progress') || '{}') } catch { return {} }
}
function getLocalHistory(): WatchHistoryItem[] {
  try { return JSON.parse(localStorage.getItem('watch_history') || '[]') } catch { return [] }
}
function getLocalFavorites(): Favorite[] {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]') } catch { return [] }
}

// ── Merge on login ─────────────────────────────────────────────────────────

export interface ContinueWatchingItem {
  movieSlug: string
  episodeSlug: string
  movieName: string
  episodeName: string
  thumbUrl: string
  positionMs: number
  durationMs: number
}

export async function mergeOnLogin(userId: string): Promise<ContinueWatchingItem | null> {
  await Promise.all([
    mergeProgress(userId),
    mergeFavorites(userId),
    mergeHistory(userId),
  ])
  return getLatestInProgress()
}

function getLatestInProgress(): ContinueWatchingItem | null {
  const history = getLocalHistory()
  const sorted = history
    .filter(h => h.durationMs > 0)
    .filter(h => {
      const pct = h.positionMs / h.durationMs
      return pct >= 0.05 && pct <= 0.90
    })
    .sort((a, b) => b.watchedAt - a.watchedAt)
  const item = sorted[0]
  if (!item) return null
  return {
    movieSlug:   item.movieSlug,
    episodeSlug: item.episodeSlug,
    movieName:   item.movieName,
    episodeName: item.episodeName ?? '',
    thumbUrl:    item.thumbUrl ?? '',
    positionMs:  item.positionMs,
    durationMs:  item.durationMs,
  }
}

async function mergeProgress(userId: string) {
  const supabase = getSupabase()
  try {
    const { data: remote } = await supabase.from('watch_progress').select('*')
    const remoteRows: RProgress[] = remote ?? []
    const local = getLocalProgress()

    // Build merged map: key = movie_slug (progress is per-movie in localStorage)
    const remoteMap = new Map(remoteRows.map(r => [r.movie_slug, r]))
    const toUpsertRemote: RProgress[] = []
    const mergedLocal = { ...local }

    for (const [movieSlug, lp] of Object.entries(local)) {
      const r = remoteMap.get(movieSlug)
      if (!r) {
        toUpsertRemote.push({
          user_id: userId, movie_slug: movieSlug, episode_slug: lp.episodeSlug,
          server_name: lp.serverName ?? '', position_ms: lp.positionMs,
          duration_ms: lp.durationMs, updated_at: lp.updatedAt,
        })
      } else if (lp.updatedAt >= r.updated_at) {
        toUpsertRemote.push({
          user_id: userId, movie_slug: movieSlug, episode_slug: lp.episodeSlug,
          server_name: lp.serverName ?? '', position_ms: lp.positionMs,
          duration_ms: lp.durationMs, updated_at: lp.updatedAt,
        })
      } else {
        // Remote is newer — update local
        mergedLocal[movieSlug] = {
          episodeSlug: r.episode_slug, positionMs: r.position_ms,
          durationMs: r.duration_ms, updatedAt: r.updated_at, serverName: r.server_name,
        }
      }
    }

    // Remote-only rows → add to local
    for (const r of remoteRows) {
      if (!(r.movie_slug in local)) {
        mergedLocal[r.movie_slug] = {
          episodeSlug: r.episode_slug, positionMs: r.position_ms,
          durationMs: r.duration_ms, updatedAt: r.updated_at, serverName: r.server_name,
        }
      }
    }

    localStorage.setItem('watch_progress', JSON.stringify(mergedLocal))
    if (toUpsertRemote.length > 0) {
      await supabase.from('watch_progress').upsert(toUpsertRemote)
    }
  } catch {}
}

async function mergeFavorites(userId: string) {
  const supabase = getSupabase()
  try {
    const { data: remote } = await supabase.from('favorites').select('*')
    const remoteRows: RFavorite[] = remote ?? []
    const local = getLocalFavorites()
    const localMap = new Map(local.map(f => [f.movieSlug, f]))
    const toUpsertRemote: RFavorite[] = []
    const mergedLocal: Favorite[] = [...local]

    for (const r of remoteRows) {
      if (r.deleted_at !== null) {
        // Deleted on another device → remove locally
        const idx = mergedLocal.findIndex(f => f.movieSlug === r.movie_slug)
        if (idx >= 0) mergedLocal.splice(idx, 1)
      } else if (!localMap.has(r.movie_slug)) {
        // Remote only (not deleted) → add locally
        mergedLocal.unshift({
          movieSlug: r.movie_slug, name: r.name, thumbUrl: r.thumb_url,
          year: r.year, episodeCurrent: r.episode_count, addedAt: r.added_at,
        })
      }
    }

    // Local-only → push to remote
    const remoteSet = new Set(remoteRows.map(r => r.movie_slug))
    for (const f of local) {
      if (!remoteSet.has(f.movieSlug)) {
        toUpsertRemote.push({
          user_id: userId, movie_slug: f.movieSlug, name: f.name,
          thumb_url: f.thumbUrl, poster_url: '',
          year: f.year, added_at: f.addedAt, episode_count: f.episodeCurrent ?? '',
          deleted_at: null,
        })
      }
    }

    localStorage.setItem('favorites', JSON.stringify(mergedLocal))
    if (toUpsertRemote.length > 0) {
      await supabase.from('favorites').upsert(toUpsertRemote)
    }
  } catch {}
}

async function mergeHistory(userId: string) {
  const supabase = getSupabase()
  try {
    const { data: remote } = await supabase.from('watch_history').select('*')
    const remoteRows: RHistory[] = remote ?? []
    const local = getLocalHistory()

    const localMap = new Map(local.map(h => [`${h.movieSlug}:${h.episodeSlug}`, h]))
    const remoteMap = new Map(remoteRows.map(r => [`${r.movie_slug}:${r.episode_slug}`, r]))
    const allKeys = Array.from(
      new Set([...Array.from(localMap.keys()), ...Array.from(remoteMap.keys())])
    )

    const toUpsertRemote: RHistory[] = []
    const mergedLocal: WatchHistoryItem[] = []

    for (const key of allKeys) {
      const l = localMap.get(key)
      const r = remoteMap.get(key)
      if (l && !r) {
        mergedLocal.push(l)
        toUpsertRemote.push({
          user_id: userId, movie_slug: l.movieSlug, episode_slug: l.episodeSlug,
          movie_name: l.movieName, episode_name: l.episodeName, thumb_url: l.thumbUrl,
          position_ms: l.positionMs, duration_ms: l.durationMs, watched_at: l.watchedAt,
          category_slugs: '',
        })
      } else if (!l && r) {
        mergedLocal.push({
          movieSlug: r.movie_slug, episodeSlug: r.episode_slug,
          movieName: r.movie_name, episodeName: r.episode_name, thumbUrl: r.thumb_url,
          positionMs: r.position_ms, durationMs: r.duration_ms, watchedAt: r.watched_at,
        })
      } else if (l && r) {
        if (l.watchedAt >= r.watched_at) {
          mergedLocal.push(l)
          toUpsertRemote.push({
            user_id: userId, movie_slug: l.movieSlug, episode_slug: l.episodeSlug,
            movie_name: l.movieName, episode_name: l.episodeName, thumb_url: l.thumbUrl,
            position_ms: l.positionMs, duration_ms: l.durationMs, watched_at: l.watchedAt,
            category_slugs: '',
          })
        } else {
          mergedLocal.push({
            movieSlug: r.movie_slug, episodeSlug: r.episode_slug,
            movieName: r.movie_name, episodeName: r.episode_name, thumbUrl: r.thumb_url,
            positionMs: r.position_ms, durationMs: r.duration_ms, watchedAt: r.watched_at,
          })
        }
      }
    }

    mergedLocal.sort((a, b) => b.watchedAt - a.watchedAt)
    localStorage.setItem('watch_history', JSON.stringify(mergedLocal.slice(0, 100)))
    if (toUpsertRemote.length > 0) {
      await supabase.from('watch_history').upsert(toUpsertRemote)
    }
  } catch {}
}

// ── Incremental push helpers (called from storage.ts after each write) ──────

export async function pushProgress(
  userId: string, movieSlug: string, episodeSlug: string,
  positionMs: number, durationMs: number, updatedAt: number,
) {
  try {
    await getSupabase().from('watch_progress').upsert({
      user_id: userId, movie_slug: movieSlug, episode_slug: episodeSlug,
      server_name: '', position_ms: positionMs, duration_ms: durationMs, updated_at: updatedAt,
    })
  } catch {}
}

export async function pushFavoriteAdded(userId: string, fav: Favorite) {
  try {
    await getSupabase().from('favorites').upsert({
      user_id: userId, movie_slug: fav.movieSlug, name: fav.name,
      thumb_url: fav.thumbUrl, poster_url: '', year: fav.year,
      added_at: fav.addedAt, episode_count: fav.episodeCurrent ?? '', deleted_at: null,
    })
  } catch {}
}

export async function pushFavoriteRemoved(userId: string, movieSlug: string) {
  try {
    await getSupabase().from('favorites')
      .update({ deleted_at: Date.now() })
      .eq('movie_slug', movieSlug)
      .eq('user_id', userId)
  } catch {}
}

export async function pushHistory(userId: string, item: WatchHistoryItem) {
  try {
    await getSupabase().from('watch_history').upsert({
      user_id: userId, movie_slug: item.movieSlug, episode_slug: item.episodeSlug,
      movie_name: item.movieName, episode_name: item.episodeName, thumb_url: item.thumbUrl,
      position_ms: item.positionMs, duration_ms: item.durationMs,
      watched_at: item.watchedAt, category_slugs: '',
    })
  } catch {}
}
