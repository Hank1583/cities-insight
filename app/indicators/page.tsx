'use client'
export const runtime = 'edge';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { apiFetch, ApiIndicator } from '@/lib/api/client'

const CATEGORIES = [
  { key: 'all',         label: '全部' },
  { key: 'environment', label: '環境' },
  { key: 'water',       label: '水資源' },
  { key: 'energy',      label: '能源' },
  { key: 'economy',     label: '經濟' },
]

const CAT_COLORS: Record<string, string> = {
  environment: 'bg-emerald-100 text-emerald-700',
  water:       'bg-sky-100 text-sky-700',
  energy:      'bg-yellow-100 text-yellow-700',
  economy:     'bg-violet-100 text-violet-700',
}

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<ApiIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    apiFetch<ApiIndicator[]>('/indicators')
      .then(data => { setIndicators(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = indicators.filter(i => {
    const matchCat    = category === 'all' || i.category_code === category
    const matchSearch = i.name_zh.includes(search) || i.code.includes(search)
    return matchCat && matchSearch
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    </div>
  )

  return (
    <div className="max-w-7xl">
      <PageHeader title="指標列表" subtitle={`共 ${indicators.length} 個指標`} />

      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋指標..." className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === c.key ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ind => (
          <Link key={ind.code} href={`/indicators/${ind.code}`}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:border-sky-300 group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{ind.name_zh}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[ind.category_code] ?? 'bg-slate-100 text-slate-600'}`}>
                {ind.category_name_zh}
              </span>
            </div>
            {ind.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{ind.description}</p>}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div><span className="text-slate-400">代碼：</span><span className="font-mono text-slate-600">{ind.code}</span></div>
              <div><span className="text-slate-400">單位：</span>{ind.unit}</div>
              <div><span className="text-slate-400">頻率：</span>{ind.freq}</div>
              <div><span className="text-slate-400">來源：</span>{ind.source_name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
