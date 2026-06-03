'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/': '總覽 Dashboard',
  '/cities': '城市列表',
  '/compare': '城市比較',
  '/indicators': '指標列表',
  '/alerts': '示警設定',
  '/reports': '月報',
}

export default function TopNavbar() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([k]) =>
    k === '/' ? pathname === '/' : pathname.startsWith(k)
  )?.[1] ?? 'Cities Insight'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 flex-shrink-0">
      <h1 className="font-semibold text-slate-800">{title}</h1>
    </header>
  )
}
