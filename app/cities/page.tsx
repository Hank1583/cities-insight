'use client'
export const runtime = 'edge';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Users, Maximize2, Wind, Zap, CloudRain } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { apiFetch, ApiCity, ApiSummary } from '@/lib/api/client'

export default function CitiesPage() {
  const [cities, setCities] = useState<ApiCity[]>([])
  const [summaryMap, setSummaryMap] = useState<Record<string, ApiSummary['metrics']>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'aqi' | 'electricity' | 'rainfall'>('name')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  useEffect(() => {
    apiFetch<ApiCity[]>('/cities').then(data => {
      setCities(data)
      Promise.all(data.map(c => apiFetch<ApiSummary>(`/cities/${c.code}/summary`))).then(summaries => {
        const map: Record<string, ApiSummary['metrics']> = {}
        summaries.forEach(s => { map[s.city.code] = s.metrics })
        setSummaryMap(map)
        setLoading(false)
      })
    }).catch(() => setLoading(false))
  }, [])

  const getVal = (code: string, key: string) => summaryMap[code]?.[key]?.value ?? 0

  const filtered = cities
    .filter(c => c.name_zh.includes(search) || c.name_en.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name_zh.localeCompare(b.name_zh)
      if (sortBy === 'aqi') return getVal(b.code, 'aqi') - getVal(a.code, 'aqi')
      if (sortBy === 'electricity') return getVal(b.code, 'electricity_load') - getVal(a.code, 'electricity_load')
      if (sortBy === 'rainfall') return getVal(b.code, 'rainfall') - getVal(a.code, 'rainfall')
      return 0
    })

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        載入中...
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl">
      <PageHeader title="城市列表" subtitle={`台灣 ${cities.length} 個縣市`} />

      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-slate-50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋城市..."
            className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">排序：</span>
          {[['name','名稱'],['aqi','AQI'],['electricity','用電'],['rainfall','降雨']].map(([v, l]) => (
            <button key={v} onClick={() => setSortBy(v as typeof sortBy)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === v ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {(['card','table'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === m ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {m === 'card' ? '卡片' : '表格'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(city => {
            const aqi = getVal(city.code, 'aqi')
            const elec = getVal(city.code, 'electricity_load')
            const rain = getVal(city.code, 'rainfall')
            const hasData = !!summaryMap[city.code]
            const aqiColor = !hasData ? 'text-slate-500' : aqi > 100 ? 'text-red-600' : aqi > 50 ? 'text-amber-600' : 'text-emerald-600'
            return (
              <Link key={city.code} href={`/cities/${city.code}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:border-sky-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{city.name_zh}</h3>
                    <p className="text-xs text-slate-500">{city.name_en}</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{city.code}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" />{city.population ? (city.population / 10000).toFixed(0) + ' 萬' : '-'}</div>
                  <div className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-slate-400" />{city.area?.toLocaleString()} km²</div>
                </div>
                {hasData && (
                  <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className={`font-bold text-base ${aqiColor}`}>{Math.round(aqi)}</div>
                      <div className="text-slate-400 flex items-center justify-center gap-0.5"><Wind className="w-3 h-3" />AQI</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base text-sky-600">{elec.toLocaleString()}</div>
                      <div className="text-slate-400 flex items-center justify-center gap-0.5"><Zap className="w-3 h-3" />MW</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base text-violet-600">{rain.toFixed(1)}</div>
                      <div className="text-slate-400 flex items-center justify-center gap-0.5"><CloudRain className="w-3 h-3" />mm</div>
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['城市','英文名','人口','面積','AQI','用電 (MW)','降雨 (mm)',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(city => {
                const aqi = getVal(city.code, 'aqi')
                const hasData = !!summaryMap[city.code]
                const aqiColor = !hasData ? '' : aqi > 100 ? 'text-red-600 font-semibold' : aqi > 50 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'
                return (
                  <tr key={city.code} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{city.name_zh}</td>
                    <td className="px-4 py-3 text-slate-500">{city.name_en}</td>
                    <td className="px-4 py-3 text-slate-600">{city.population ? (city.population / 10000).toFixed(0) + '萬' : '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{city.area?.toLocaleString()}</td>
                    <td className={`px-4 py-3 ${aqiColor}`}>{hasData ? Math.round(aqi) : '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{hasData ? getVal(city.code, 'electricity_load').toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{hasData ? getVal(city.code, 'rainfall').toFixed(1) : '-'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/cities/${city.code}`} className="text-sky-500 hover:text-sky-700 font-medium text-xs">詳細 →</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
