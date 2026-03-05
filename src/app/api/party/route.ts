import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Unambiguous chars: no 0/O, no 1/I
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length))
  }
  return code
}

async function createSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// POST /api/party — tạo phòng mới
export async function POST(request: NextRequest) {
  const supabase = await createSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 })

  const body = await request.json()
  const { movieSlug, episodeSlug, serverName } = body

  if (!movieSlug || !episodeSlug) {
    return NextResponse.json({ error: 'Thiếu thông tin phim' }, { status: 400 })
  }

  // Thử tạo với code ngẫu nhiên (retry nếu trùng)
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode()
    const { data, error } = await supabase
      .from('watch_party_sessions')
      .insert({
        code,
        host_user_id: user.id,
        movie_slug: movieSlug,
        episode_slug: episodeSlug,
        server_name: serverName || '',
      })
      .select('code, id')
      .single()

    if (!error && data) {
      return NextResponse.json({ code: data.code, partyId: data.id })
    }
    // 23505 = unique_violation — thử lại với code khác
    if (error?.code !== '23505') {
      return NextResponse.json({ error: 'Không thể tạo phòng' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Vui lòng thử lại' }, { status: 500 })
}

// GET /api/party?code=XK7P2M — lấy thông tin phòng
export async function GET(request: NextRequest) {
  const supabase = await createSupabase()

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.toUpperCase()

  if (!code) return NextResponse.json({ error: 'Thiếu code' }, { status: 400 })

  const { data, error } = await supabase
    .from('watch_party_sessions')
    .select('code, movie_slug, episode_slug, server_name, host_user_id')
    .eq('code', code)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Phòng không tồn tại hoặc đã hết hạn' }, { status: 404 })
  }

  return NextResponse.json({
    code: data.code,
    movieSlug: data.movie_slug,
    episodeSlug: data.episode_slug,
    serverName: data.server_name,
    hostUserId: data.host_user_id,
  })
}
