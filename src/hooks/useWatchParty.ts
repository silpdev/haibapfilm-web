'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export interface WatchPartyMember {
  userId: string
  displayName: string
  isHost: boolean
  joinedAt: number
}

interface SyncPayload {
  positionMs: number
  isPlaying: boolean
  sentAt: number
}

interface UseWatchPartyOptions {
  partyCode: string | null
  isHost: boolean
  onSyncReceived: (posMs: number, isPlaying: boolean) => void
  onHostLeft: () => void
}

export function useWatchParty({
  partyCode,
  isHost,
  onSyncReceived,
  onHostLeft,
}: UseWatchPartyOptions) {
  const { user } = useAuth()
  const [members, setMembers] = useState<WatchPartyMember[]>([])
  const [connected, setConnected] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null)
  const hostSeenRef = useRef(false)
  // Stable refs for callbacks to avoid re-subscribing on every render
  const onSyncRef = useRef(onSyncReceived)
  const onHostLeftRef = useRef(onHostLeft)
  useEffect(() => { onSyncRef.current = onSyncReceived }, [onSyncReceived])
  useEffect(() => { onHostLeftRef.current = onHostLeft }, [onHostLeft])

  // Host gọi hàm này để broadcast vị trí phát
  const broadcastSync = useCallback((positionMs: number, isPlaying: boolean) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'sync',
      payload: { positionMs, isPlaying, sentAt: Date.now() } satisfies SyncPayload,
    })
  }, [])

  useEffect(() => {
    if (!partyCode || !user) return

    const supabase = getSupabase()
    const channel = supabase.channel(`watch-party:${partyCode}`)
    channelRef.current = channel
    hostSeenRef.current = false

    const displayName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split('@')[0] ||
      'Ẩn danh'

    // Presence: theo dõi danh sách thành viên
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{
        user_id: string
        display_name: string
        is_host: boolean
        joined_at: number
      }>()

      const memberList: WatchPartyMember[] = []
      for (const presences of Object.values(state)) {
        for (const p of presences) {
          memberList.push({
            userId: p.user_id,
            displayName: p.display_name,
            isHost: p.is_host,
            joinedAt: p.joined_at,
          })
        }
      }

      const hasHost = memberList.some(m => m.isHost)
      // Nếu host đã từng có mặt nhưng giờ không còn → thông báo
      if (hostSeenRef.current && !hasHost && !isHost) {
        onHostLeftRef.current()
      }
      if (hasHost) hostSeenRef.current = true

      setMembers(memberList)
    })

    // Broadcast: guests nhận lệnh sync từ host
    if (!isHost) {
      channel.on('broadcast', { event: 'sync' }, ({ payload }: { payload: SyncPayload }) => {
        const latency = Date.now() - payload.sentAt
        const adjustedPos = Math.max(0, payload.positionMs + latency / 2)
        onSyncRef.current(adjustedPos, payload.isPlaying)
      })
    }

    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true)
        await channel.track({
          user_id: user.id,
          display_name: displayName,
          is_host: isHost,
          joined_at: Date.now(),
        })
      }
    })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      setConnected(false)
      setMembers([])
      hostSeenRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyCode, user?.id, isHost])

  return { members, connected, broadcastSync }
}
