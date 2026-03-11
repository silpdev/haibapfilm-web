import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { buildIcs } from '@/lib/ics'
import { buildScheduleEmailHtml } from '@/lib/email'

async function sendMailgun(params: {
  to: string[]
  subject: string
  html: string
  icsContent: string
}): Promise<string | null> {
  const apiKey   = process.env.MAILGUN_API_KEY
  const domain   = process.env.MAILGUN_DOMAIN
  const from     = process.env.MAILGUN_FROM_EMAIL ?? `noreply@${domain}`
  const apiBase  = process.env.MAILGUN_API_URL ?? 'https://api.mailgun.net'

  if (!apiKey || !domain) return 'MAILGUN_API_KEY hoặc MAILGUN_DOMAIN chưa được cấu hình'

  const form = new FormData()
  form.append('from',    `HaiBapFilm <${from}>`)
  params.to.forEach(email => form.append('to', email))
  form.append('subject', params.subject)
  form.append('html',    params.html)
  form.append(
    'attachment',
    new Blob([params.icsContent], { type: 'text/calendar; charset=utf-8; method=REQUEST' }),
    'watch-party.ics',
  )

  const credentials = Buffer.from(`api:${apiKey}`).toString('base64')
  const res = await fetch(`${apiBase}/v3/${domain}/messages`, {
    method:  'POST',
    headers: { Authorization: `Basic ${credentials}` },
    body:    form,
  })

  if (!res.ok) {
    const body = await res.text()
    return `Mailgun ${res.status}: ${body}`
  }
  return null
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://film.lamphusi.tech'

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
        setAll(cs) { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 })

  const body = await request.json()
  const {
    movieSlug, episodeSlug, serverName = '',
    movieTitle, moviePosterUrl = '', movieDescription = '', episodeName = '',
    scheduledFor,      // ISO string (UTC)
    durationMinutes,
    guestEmails,
  } = body

  // Validate
  if (!movieSlug || !episodeSlug || !movieTitle) {
    return NextResponse.json({ error: 'Thiếu thông tin phim' }, { status: 400 })
  }
  if (!scheduledFor || !durationMinutes) {
    return NextResponse.json({ error: 'Thiếu ngày giờ hoặc thời lượng' }, { status: 400 })
  }
  const scheduledDate = new Date(scheduledFor)
  if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now() + 60000) {
    return NextResponse.json({ error: 'Thời gian phải ít nhất 1 phút trong tương lai' }, { status: 400 })
  }
  if (!Array.isArray(guestEmails) || guestEmails.length === 0 || guestEmails.length > 20) {
    return NextResponse.json({ error: 'Cần ít nhất 1 email (tối đa 20)' }, { status: 400 })
  }
  const validEmails: string[] = guestEmails.filter(isValidEmail)
  if (validEmails.length === 0) {
    return NextResponse.json({ error: 'Không có email hợp lệ' }, { status: 400 })
  }

  // Generate unique party code
  let partyData: { id: string; code: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode()
    const expiresAt = new Date(scheduledDate.getTime() + durationMinutes * 60000 + 3600000)
    const { data, error } = await supabase
      .from('watch_party_sessions')
      .insert({
        code,
        host_user_id:    user.id,
        movie_slug:      movieSlug,
        episode_slug:    episodeSlug,
        server_name:     serverName,
        is_active:       true,
        expires_at:      expiresAt.toISOString(),
        scheduled_for:   scheduledDate.toISOString(),
        duration_minutes: Number(durationMinutes),
        invited_emails:  validEmails,
        invite_sent_at:  null,
        movie_title:     movieTitle,
        movie_poster_url: moviePosterUrl,
        episode_name:    episodeName,
      })
      .select('id, code')
      .single()

    if (!error && data) { partyData = data; break }
    if (error?.code !== '23505') {
      console.error('Party insert error:', error)
      return NextResponse.json({ error: 'Không thể tạo phòng' }, { status: 500 })
    }
  }
  if (!partyData) return NextResponse.json({ error: 'Vui lòng thử lại' }, { status: 500 })

  const { id: partyId, code } = partyData
  const watchUrl = `${APP_URL}/watch/${movieSlug}?episode=${episodeSlug}&party=${code}`

  // Build ICS
  const icsContent = buildIcs({
    partyId,
    code,
    movieTitle,
    movieSlug,
    episodeSlug,
    scheduledFor: scheduledDate,
    durationMinutes: Number(durationMinutes),
    appUrl: APP_URL,
  })

  // Host display name
  const hostName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Host'

  // Build HTML email
  const html = buildScheduleEmailHtml({
    movieTitle,
    moviePosterUrl,
    movieDescription,
    episodeName,
    scheduledFor: scheduledDate,
    durationMinutes: Number(durationMinutes),
    code,
    watchUrl,
    hostName,
  })

  // Send emails via Mailgun
  let emailError: string | null = null
  try {
    emailError = await sendMailgun({
      to:         validEmails,
      subject:    `🎬 Lời mời Watch Party: ${movieTitle}`,
      html,
      icsContent,
    })

    if (!emailError) {
      await supabase
        .from('watch_party_sessions')
        .update({ invite_sent_at: new Date().toISOString() })
        .eq('id', partyId)
    } else {
      console.error('Mailgun error:', emailError)
    }
  } catch (err) {
    emailError = err instanceof Error ? err.message : 'Email send failed'
    console.error('Email send error:', err)
  }

  return NextResponse.json({
    code,
    partyId,
    scheduledFor: scheduledDate.toISOString(),
    emailError,   // null if success, error message if failed
  }, { status: 201 })
}
