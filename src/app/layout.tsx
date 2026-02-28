import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'HaiBapFilm — Xem Phim Online Miễn Phí',
  description: 'Xem phim online miễn phí chất lượng cao — phim bộ, phim lẻ, hoạt hình, TV shows cập nhật hàng ngày.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');}catch(e){}})();` }} />
      </head>
      <body className="min-h-screen bg-[--bg] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200"
            style={{ backgroundColor: 'var(--bg)' }}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
