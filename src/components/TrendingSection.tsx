import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

interface ViewCount {
  movie_slug: string
  movie_name: string
  thumb_url: string
  today_count: number
}

async function getTrending(): Promise<ViewCount[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('view_counts')
    .select('movie_slug, movie_name, thumb_url, today_count')
    .eq('today_date', today)
    .gt('today_count', 0)
    .order('today_count', { ascending: false })
    .limit(12)
  return (data ?? []) as ViewCount[]
}

const RANK_COLOR = [
  'bg-yellow-500',   // #1
  'bg-gray-400',     // #2
  'bg-amber-700',    // #3
]

export default async function TrendingSection() {
  const trending = await getTrending()
  if (trending.length < 3) return null   // don't show until there's meaningful data

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-orange-500 rounded-full inline-block" />
          🔥 Đang Hot Hôm Nay
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {trending.map((item, idx) => (
          <Link key={item.movie_slug} href={`/movie/${item.movie_slug}`} className="group block">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
              {item.thumb_url && (
                <Image
                  src={item.thumb_url}
                  alt={item.movie_name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              )}
              {/* Rank badge */}
              <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                RANK_COLOR[idx] ?? 'bg-black/60'
              }`}>
                {idx + 1}
              </div>
              {/* View count */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                <span className="text-[10px] text-orange-400">🔥 {item.today_count}</span>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-purple-600 rounded-full p-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="mt-2 px-0.5">
              <p className="text-sm font-medium text-gray-100 truncate group-hover:text-purple-400 transition-colors">
                {item.movie_name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
