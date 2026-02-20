import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'HaiBapFilm',
  description: 'Xem phim online miễn phí - HaiBapFilm',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#0f0f0f] text-gray-100">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
