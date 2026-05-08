import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '상상우리 매칭 시스템',
  description: '시니어 ↔ 일자리 자동 매칭 MVP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-black text-blue-600 shrink-0 hover:text-blue-700 transition-colors">
              상상우리 매칭
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/register"
                className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                시니어 등록
              </Link>
              <Link href="/recommendations"
                className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                추천 보기
              </Link>
              <Link href="/admin"
                className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                관리자
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
