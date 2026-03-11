import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const TRACKED_PREFIXES = ['/', '/watch/', '/movie/', '/danh-sach/', '/the-loai/', '/search']
const BOT_PATTERNS = /bot|crawler|spider|scraper|curl|wget|python|java|go-http|node-fetch/i
const PRIVATE_IP = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/

function shouldTrack(pathname: string): boolean {
  return TRACKED_PREFIXES.some((prefix) =>
    prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
  )
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true
  return BOT_PATTERNS.test(userAgent)
}

async function trackWithGeo(payload: {
  path: string
  ip: string | null
  user_agent: string | null
  referer: string | null
}) {
  let country: string | null = null
  let city: string | null = null

  if (payload.ip && !PRIVATE_IP.test(payload.ip)) {
    try {
      const res = await fetch(`https://ipwho.is/${payload.ip}?fields=success,country,city`, {
        signal: AbortSignal.timeout(1500),
      })
      if (res.ok) {
        const geo = await res.json()
        if (geo.success) {
          country = geo.country ?? null
          city = geo.city ?? null
        }
      }
    } catch {
      // GeoIP failed — insert without location
    }
  }

  await fetch(`${SUPABASE_URL}/rest/v1/web_visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...payload, country, city }),
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (shouldTrack(pathname)) {
    const userAgent = request.headers.get('user-agent')
    if (!isBot(userAgent)) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        null

      // Fire and forget — response is NOT delayed
      trackWithGeo({
        path: pathname,
        ip,
        user_agent: userAgent,
        referer: request.headers.get('referer') || null,
      }).catch(() => {})
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/).*)'],
}
