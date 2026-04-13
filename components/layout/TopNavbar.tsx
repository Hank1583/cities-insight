'use client'
import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/': '總覽 Dashboard',
  '/cities': '城市列表',
  '/compare': '城市比較',
  '/indicators': '指標列表',
  '/alerts': '示警紀錄',
  '/reports': '週報管理',
}

export default function TopNavbar() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([k]) =>
    k === '/' ? pathname === '/' : pathname.startsWith(k)
  )?.[1] ?? 'Cities Insight'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="font-semibold text-slate-800 flex-1">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm text-slate-500">
          <Search className="w-3.5 h-3.5" />
          <span>搜尋...</span>
        </div>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold">
          CI
        </div>
      </div>
    </header>
  )
}
