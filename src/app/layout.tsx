import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'HaiBapFilm — Xem Phim Online Miễn Phí',
  description: 'Xem phim online miễn phí chất lượng cao — phim bộ, phim lẻ, hoạt hình, TV shows cập nhật hàng ngày.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#0f0f0f] text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
