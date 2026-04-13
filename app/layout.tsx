import type { Metadata } from 'next'
import './globals.css'
import AppSidebar from '@/components/layout/AppSidebar'
import TopNavbar from '@/components/layout/TopNavbar'

export const metadata: Metadata = {
  title: 'Cities Insight - Taiwan Urban Data Platform',
  description: '探索台灣各縣市的環境、能源、水資源與經濟趨勢',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="flex h-screen overflow-hidden bg-slate-50">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
