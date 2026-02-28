import { getHomeMultiSection } from '@/lib/api'
import MovieGrid from '@/components/MovieGrid'
import ContinueWatchingBanner from '@/components/ContinueWatchingBanner'
import TrendingSection from '@/components/TrendingSection'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'

export default async function HomePage() {
  const { newest, series, anime, featured } = await getHomeMultiSection()

  return (
    <div className="space-y-14">
      <ContinueWatchingBanner />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[420px] md:h-[520px] overflow-hidden">
        {/* Background image */}
        {featured && (featured.posterUrl || featured.thumbUrl) && (
          <Image
            src={featured.posterUrl || featured.thumbUrl}
            alt={featured.name}
            fill
            className="object-cover object-top opacity-40"
            priority
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12">
          {featured ? (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {featured.quality && (
                  <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {featured.quality}
                  </span>
                )}
                {featured.year > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">{featured.year}</span>
                )}
                {featured.categories.slice(0, 2).map(c => (
                  <span key={c.id} className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full">{c.name}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white max-w-xl leading-tight">
                {featured.name}
              </h1>
              {featured.originName && (
                <p className="text-gray-400 mt-1 text-sm">{featured.originName}</p>
              )}
              <div className="flex gap-3 mt-5">
                <Link
                  href={`/movie/${featured.slug}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Xem ngay
                </Link>
                <Link
                  href={`/movie/${featured.slug}`}
                  className="bg-white/15 hover:bg-white/25 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Chi tiết
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white">HaiBapFilm</h1>
              <p className="text-gray-400 mt-2">Xem phim online miễn phí, chất lượng cao</p>
              <Link href="/danh-sach/phim-moi" className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors w-fit">
                Khám phá phim
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Content sections ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 space-y-14 pb-8">
        {/* 🔥 Trending hôm nay */}
        <Suspense fallback={null}>
          <TrendingSection />
        </Suspense>

        {/* Phim Mới */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
              Phim Mới Cập Nhật
            </h2>
            <Link href="/danh-sach/phim-moi" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <MovieGrid movies={newest} />
        </section>

        {/* Phim Bộ */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
              Phim Bộ
            </h2>
            <Link href="/danh-sach/phim-bo" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <MovieGrid movies={series} />
        </section>

        {/* Hoạt Hình */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-pink-500 rounded-full inline-block" />
              Hoạt Hình
            </h2>
            <Link href="/danh-sach/hoat-hinh" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <MovieGrid movies={anime} />
        </section>
      </div>
    </div>
  )
}
