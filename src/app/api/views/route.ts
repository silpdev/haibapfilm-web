import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { slug, name, thumbUrl } = await req.json() as {
      slug: string; name: string; thumbUrl: string
    }
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 })

    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('view_counts')
      .select('today_count, today_date, total_count')
      .eq('movie_slug', slug)
      .single()

    if (existing) {
      const todayCount = existing.today_date === today ? existing.today_count + 1 : 1
      await supabase
        .from('view_counts')
        .update({
          today_count: todayCount,
          total_count: existing.total_count + 1,
          today_date: today,
          movie_name: name || '',
          thumb_url: thumbUrl || '',
          updated_at: new Date().toISOString(),
        })
        .eq('movie_slug', slug)
    } else {
      await supabase.from('view_counts').insert({
        movie_slug: slug,
        movie_name: name || '',
        thumb_url: thumbUrl || '',
        today_count: 1,
        total_count: 1,
        today_date: today,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
