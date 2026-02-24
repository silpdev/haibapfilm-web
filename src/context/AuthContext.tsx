'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'
import { mergeOnLogin, type ContinueWatchingItem } from '@/lib/syncStorage'

interface AuthContextValue {
  user: User | null
  loading: boolean
  continueItem: ContinueWatchingItem | null
  dismissContinueItem: () => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  continueItem: null,
  dismissContinueItem: () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [continueItem, setContinueItem] = useState<ContinueWatchingItem | null>(null)
  const mergedForRef = useRef<string | null>(null)

  useEffect(() => {
    const supabase = getSupabase()

    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(prev => {
        // Trigger merge when transitioning from null → signed-in
        if (!prev && nextUser && mergedForRef.current !== nextUser.id) {
          mergedForRef.current = nextUser.id
          mergeOnLogin(nextUser.id).then(item => { if (item) setContinueItem(item) }).catch(() => {})
        }
        return nextUser
      })
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
  }, [])

  const dismissContinueItem = useCallback(() => setContinueItem(null), [])

  return (
    <AuthContext.Provider value={{ user, loading, continueItem, dismissContinueItem, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
