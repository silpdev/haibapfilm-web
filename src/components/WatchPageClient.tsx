'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import WatchPartyPanel from '@/components/WatchPartyPanel'
import { useWatchParty } from '@/hooks/useWatchParty'
import { useAuth } from '@/context/AuthContext'
import type { MovieDetail, EpisodeItem } from '@/lib/types'

interface Props {
  movie: MovieDetail
  episode: EpisodeItem
  episodeName: string
  serverName: string
  initialPartyCode: string | null
}

export default function WatchPageClient({
  movie,
  episode,
  episodeName,
  serverName,
  initialPartyCode,
}: Props) {
  const { user } = useAuth()
  const router = useRouter()

  const [partyCode, setPartyCode] = useState<string | null>(initialPartyCode)
  const [isHost, setIsHost] = useState(false)
  const [hostLeft, setHostLeft] = useState(false)

  // Dùng object với id thay đổi để trigger effect trong VideoPlayer
  const [externalSeek, setExternalSeek] = useState<{ posMs: number; id: number } | null>(null)
  const [guestPaused, setGuestPaused] = useState(false)

  const broadcastSyncRef = useRef<(posMs: number, isPlaying: boolean) => void>(() => {})

  // Nếu load trang với ?party=CODE, xác định xem user có phải host không
  useEffect(() => {
    if (!initialPartyCode || !user) return
    fetch(`/api/party?code=${initialPartyCode}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.hostUserId === user.id) setIsHost(true)
      })
      .catch(() => {})
  }, [initialPartyCode, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSyncReceived = useCallback((posMs: number, isPlaying: boolean) => {
    setExternalSeek({ posMs, id: Date.now() })
    setGuestPaused(!isPlaying)
  }, [])

  const handleHostLeft = useCallback(() => {
    setHostLeft(true)
    setGuestPaused(true)
  }, [])

  const { members, connected, broadcastSync } = useWatchParty({
    partyCode,
    isHost,
    onSyncReceived: handleSyncReceived,
    onHostLeft: handleHostLeft,
  })

  broadcastSyncRef.current = broadcastSync

  // Host gọi khi position thay đổi (interval 5s + play/pause/seek)
  const handlePositionChange = useCallback((posMs: number, isPlaying: boolean) => {
    if (isHost && partyCode) {
      broadcastSyncRef.current(posMs, isPlaying)
    }
  }, [isHost, partyCode])

  async function handleCreateParty() {
    if (!user) return
    const res = await fetch('/api/party', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movieSlug: movie.slug,
        episodeSlug: episode.slug,
        serverName,
      }),
    })
    if (!res.ok) throw new Error('Failed to create party')
    const data = await res.json()
    setPartyCode(data.code)
    setIsHost(true)
    setHostLeft(false)
    router.replace(
      `/watch/${movie.slug}?episode=${episode.slug}&party=${data.code}`,
      { scroll: false }
    )
  }

  async function handleJoinParty(code: string) {
    const res = await fetch(`/api/party?code=${code}`)
    if (!res.ok) throw new Error('Party not found')
    const data = await res.json()
    // Điều hướng về đúng phim/tập của host
    router.push(`/watch/${data.movieSlug}?episode=${data.episodeSlug}&party=${code}`)
  }

  function handleLeaveParty() {
    setPartyCode(null)
    setIsHost(false)
    setHostLeft(false)
    setGuestPaused(false)
    router.replace(`/watch/${movie.slug}?episode=${episode.slug}`, { scroll: false })
  }

  function handleDismissHostLeft() {
    setHostLeft(false)
    setGuestPaused(false)
    setPartyCode(null)
    setIsHost(false)
    router.replace(`/watch/${movie.slug}?episode=${episode.slug}`, { scroll: false })
  }

  return (
    <>
      <VideoPlayer
        movie={movie}
        episode={episode}
        episodeName={episodeName}
        serverName={serverName}
        isGuestInParty={!!partyCode && !isHost}
        externalSeek={externalSeek}
        guestPaused={guestPaused}
        onPositionChange={handlePositionChange}
      />
      <WatchPartyPanel
        user={user}
        partyCode={partyCode}
        isHost={isHost}
        members={members}
        connected={connected}
        hostLeft={hostLeft}
        onCreateParty={handleCreateParty}
        onJoinParty={handleJoinParty}
        onLeaveParty={handleLeaveParty}
        onDismissHostLeft={handleDismissHostLeft}
      />
    </>
  )
}
