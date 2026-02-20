import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-purple-400 font-bold text-lg">🎬 HaiBapFilm</p>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Xem phim online miễn phí, chất lượng cao, cập nhật hàng ngày.
            </p>
            <p className="text-gray-600 text-xs mt-4 leading-relaxed">
              ⚠️ Lịch sử và yêu thích được lưu trên trình duyệt của bạn — không đồng bộ giữa các thiết bị.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Danh mục</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              {[
                ['Phim Mới', '/danh-sach/phim-moi'],
                ['Phim Bộ', '/danh-sach/phim-bo'],
                ['Phim Lẻ', '/danh-sach/phim-le'],
                ['Hoạt Hình', '/danh-sach/hoat-hinh'],
                ['TV Shows', '/danh-sach/tv-shows'],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-purple-400 transition-colors w-fit">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account / Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Liên kết</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <Link href="/history" className="hover:text-purple-400 transition-colors w-fit">Lịch sử xem</Link>
              <Link href="/favorites" className="hover:text-purple-400 transition-colors w-fit">Phim yêu thích</Link>
              <Link href="/search" className="hover:text-purple-400 transition-colors w-fit">Tìm kiếm</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} HaiBapFilm.</span>
          <span>Chỉ dùng cho mục đích học tập và nghiên cứu.</span>
        </div>
      </div>
    </footer>
  )
}
