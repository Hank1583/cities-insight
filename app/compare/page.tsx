'use client'
export const runtime = 'edge';
import { useState, useEffect, useCallback } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import CompareLineChart from '@/components/charts/CompareLineChart'
import { apiFetch, ApiCity, ApiIndicator, ApiCompare } from '@/lib/api/client'

const DEFAULT_CITIES = ['taipei', 'taichung', 'kaohsiung', 'tainan', 'taoyuan']
const DEFAULT_INDICATOR = 'aqi'
// electricity_load / reserve_margin 是全國指標，各縣市數值相同，不適合城市比較
const COMPARE_INDICATORS = ['aqi', 'pm25', 'weather_temp', 'rainfall', 'reservoir_storage', 'electricity_monthly']

export default function ComparePage() {
  const [cities, setCities] = useState<ApiCity[]>([])
  const [indicators, setIndicators] = useState<ApiIndicator[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>(DEFAULT_CITIES)
  const [indicator, setIndicator] = useState(DEFAULT_INDICATOR)
  const [range, setRange] = useState(30)
  const [compareData, setCompareData] = useState<ApiCompare | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiFetch<ApiCity[]>('/cities').then(setCities)
    apiFetch<ApiIndicator[]>('/indicators').then(setIndicators)
  }, [])

  const fetchCompare = useCallback(() => {
    if (selectedCities.length === 0) return
    setLoading(true)
    apiFetch<ApiCompare>(`/compare?indicator=${indicator}&cities=${selectedCities.join(',')}&range=${indicator === 'electricity_monthly' ? '365d&granularity=month' : `${range}d&granularity=day`}`)
      .then(data => { setCompareData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [indicator, selectedCities, range])

  useEffect(() => { fetchCompare() }, [fetchCompare])

  const toggleCity = (code: string) => {
    setSelectedCities(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code].slice(0, 6)
    )
  }

  const indicatorInfo = indicators.find(i => i.code === indicator)
  const cityNames = Object.fromEntries(cities.map(c => [c.code, c.name_zh]))

  const rankingStats = compareData
    ? compareData.cities.map(c => {
        const series = compareData.series[c.code] ?? []
        const latest = series.length ? series[series.length - 1].value : 0
        return { code: c.code, name: c.nameZh, value: latest }
      }).sort((a, b) => b.value - a.value)
    : []

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader title="城市比較" subtitle="選擇指標與城市，比較多城市的趨勢變化" />

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-2">指標選擇</label>
          <div className="flex flex-wrap gap-2">
            {COMPARE_INDICATORS.map(code => {
              const ind = indicators.find(i => i.code === code)
              return (
                <button key={code} onClick={() => setIndicator(code)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${indicator === code ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {ind?.name_zh ?? code}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 block mb-2">城市選擇（最多 6 個）</label>
          <div className="flex flex-wrap gap-2">
            {cities.map(city => (
              <button key={city.code} onClick={() => toggleCity(city.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCities.includes(city.code) ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {city.name_zh}
              </button>
            ))}
          </div>
        </div>

        {indicator !== 'electricity_monthly' && (
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-2">時間範圍</label>
            <div className="flex gap-2">
              {([[7,'7天'],[30,'30天'],[90,'90天']] as [number,string][]).map(([v,l]) => (
                <button key={v} onClick={() => setRange(Number(v))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === Number(v) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-slate-400">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2" />載入中...
        </div>
      )}

      {!loading && compareData && Object.keys(compareData.series).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">
            {indicatorInfo?.name_zh ?? indicator} 比較
            {indicator === 'electricity_monthly' ? ' — 近 12 個月' : ` — 近 ${range} 天`}
            <span className="text-sm font-normal text-slate-400 ml-2">({indicatorInfo?.unit})</span>
          </h3>
          <CompareLineChart data={compareData.series} cityNames={cityNames} unit={indicatorInfo?.unit ?? ''} />
        </div>
      )}

      {!loading && selectedCities.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">請選擇至少一個城市</div>
      )}

      {rankingStats.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700">最新數值排行</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">排名</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">城市</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">數值 ({indicatorInfo?.unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankingStats.map((s, i) => (
                <tr key={s.code} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-700">{s.value.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
