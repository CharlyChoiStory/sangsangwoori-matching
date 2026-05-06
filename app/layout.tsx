import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '상상우리 매칭 시스템',
  description: '시니어 ↔ 일자리 자동 매칭 MVP',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  )
}
