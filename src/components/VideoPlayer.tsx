'use client'

import { useEffect, useRef, useState } from 'react'
import { saveProgress, getProgress, addHistory } from '@/lib/storage'
import type { MovieDetail, EpisodeItem } from '@/lib/types'

interface Props {
  movie: MovieDetail
  episode: EpisodeItem
  episodeName: string
  serverName: string
}

export default function VideoPlayer({ movie, episode, episodeName }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [useEmbed, setUseEmbed] = useState(false)

  useEffect(() => {
    setError('')
    setUseEmbed(false)

    const video = videoRef.current
    if (!video) return
    if (!episode.linkM3u8) {
      setUseEmbed(true)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: { destroy: () => void; loadSource: (s: string) => void; attachMedia: (v: HTMLVideoElement) => void; on: (event: any, cb: any) => void } | null = null

    async function init() {
      const Hls = (await import('hls.js')).default
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true })
        hls.loadSource(episode.linkM3u8)
        hls.attachMedia(video!)
        hls.on('hlsError', (_: unknown, data: { fatal: boolean }) => {
          if (data.fatal) {
            setError('Không thể phát video. Thử nguồn embed.')
          }
        })
      } else if (video!.canPlayType('application/vnd.apple.mpegurl')) {
        video!.src = episode.linkM3u8
      } else {
        setUseEmbed(true)
        return
      }

      // Restore position
      const saved = getProgress(movie.slug)
      if (saved && saved.episodeSlug === episode.slug && saved.positionMs > 5000) {
        video!.currentTime = saved.positionMs / 1000
      }

      video!.play().catch(() => {})
    }

    init()
    return () => { hls?.destroy() }
  }, [episode.linkM3u8, episode.slug, movie.slug])

  // Save progress every 5s
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function onTimeUpdate() {
      if (!video || video.duration < 1) return
      const posMs = video.currentTime * 1000
      const durMs = video.duration * 1000
      saveProgress(movie.slug, episode.slug, posMs, durMs)
      addHistory({
        movieSlug: movie.slug,
        movieName: movie.name,
        episodeSlug: episode.slug,
        episodeName,
        thumbUrl: movie.thumbUrl,
        positionMs: posMs,
        durationMs: durMs,
        watchedAt: Date.now(),
      })
    }

    let interval: ReturnType<typeof setInterval>
    function onPlay() { interval = setInterval(onTimeUpdate, 5000) }
    function onPause() { clearInterval(interval); onTimeUpdate() }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      clearInterval(interval)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [episode.slug, movie.slug, movie.name, movie.thumbUrl, episodeName])

  if (useEmbed && episode.linkEmbed) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={episode.linkEmbed}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      </div>
    )
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <p className="text-red-400 text-sm">{error}</p>
          {episode.linkEmbed && (
            <button
              onClick={() => setUseEmbed(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-full transition-colors"
            >
              Xem embed
            </button>
          )}
        </div>
      )}
    </div>
  )
}
