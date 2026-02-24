import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase singleton — safe to import in client components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// Convenience singleton for direct use in utility files.
let _client: ReturnType<typeof createClient> | null = null
export function getSupabase() {
  if (!_client) _client = createClient()
  return _client
}
