import { getHome, getMovieList } from '@/lib/api'
import MovieGrid from '@/components/MovieGrid'
import Link from 'next/link'

export default async function HomePage() {
  const [home, trending] = await Promise.all([
    getHome().catch(() => ({ sections: [] })),
    getMovieList('phim-moi', 1).catch(() => ({ movies: [] })),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Hero banner */}
      <section className="bg-gradient-to-r from-purple-900/40 to-[#1a1a2e] rounded-2xl p-8 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-white">Xem Phim Online Miễn Phí</h1>
        <p className="text-gray-400 max-w-xl">
          Hàng nghìn bộ phim HD, phim bộ, phim lẻ, hoạt hình — cập nhật hàng ngày.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/danh-sach/phim-moi" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
            Xem ngay
          </Link>
          <Link href="/danh-sach/phim-bo" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
            Phim Bộ
          </Link>
        </div>
      </section>

      {/* Quick category links */}
      <section>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Phim Mới', href: '/danh-sach/phim-moi' },
            { label: 'Phim Bộ', href: '/danh-sach/phim-bo' },
            { label: 'Phim Lẻ', href: '/danh-sach/phim-le' },
            { label: 'Hoạt Hình', href: '/danh-sach/hoat-hinh' },
            { label: 'TV Shows', href: '/danh-sach/tv-shows' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="bg-white/10 hover:bg-purple-600 text-sm px-4 py-1.5 rounded-full transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Home sections from API */}
      {home.sections.map(s => (
        <MovieGrid key={s.slug} movies={s.movies} title={s.title} />
      ))}

      {/* Trending / newest */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Phim Mới Cập Nhật</h2>
          <Link href="/danh-sach/phim-moi" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Xem tất cả →
          </Link>
        </div>
        <MovieGrid movies={trending.movies} />
      </section>
    </div>
  )
}
