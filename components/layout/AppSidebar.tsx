'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MapPin, GitCompare, BarChart2,
  Bell, FileText, Zap
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cities', label: '城市列表', icon: MapPin },
  { href: '/compare', label: '城市比較', icon: GitCompare },
  { href: '/indicators', label: '指標列表', icon: BarChart2 },
  { href: '/alerts', label: '示警', icon: Bell },
  { href: '/reports', label: '週報', icon: FileText },
]

export default function AppSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Cities Insight</div>
            <div className="text-slate-400 text-xs">Taiwan Urban Data</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-slate-500 text-xs">v0.1.0 · 資料來源：政府開放資料</p>
      </div>
    </aside>
  )
}
