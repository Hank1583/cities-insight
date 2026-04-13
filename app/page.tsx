export const runtime = 'edge';
import { Wind, Zap, CloudRain, Droplets, Activity } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import AlertCard from '@/components/dashboard/AlertCard'
import Link from 'next/link'
import { apiFetch, ApiCity, ApiSummary, ApiAlertLog } from '@/lib/api/client'

export default async function DashboardPage() {
  let cities: ApiCity[] = []
  let alerts: ApiAlertLog[] = []
  let summaries: ApiSummary[] = []

  try {
    cities = await apiFetch<ApiCity[]>('/cities')
    alerts = await apiFetch<ApiAlertLog[]>('/alerts?limit=4')
    summaries = await Promise.all(
      cities.slice(0, 22).map(c => apiFetch<ApiSummary>(`/cities/${c.code}/summary`))
    )
  } catch {
    // fallback: show empty state
  }

  const getVal = (s: ApiSummary, key: string) => s.metrics[key]?.value ?? 0

  const validSummaries = summaries.filter(s => Object.keys(s.metrics).length > 0)

  const avgAqi = validSummaries.length
    ? Math.round(validSummaries.reduce((acc, s) => acc + getVal(s, 'aqi'), 0) / validSummaries.length)
    : 0
  const avgReservoir = validSummaries.length
    ? (validSummaries.reduce((acc, s) => acc + getVal(s, 'reservoir_storage'), 0) / validSummaries.length).toFixed(1)
    : '0'
  const totalElectricity = validSummaries.reduce((acc, s) => acc + getVal(s, 'electricity_load'), 0)
  const avgMargin = validSummaries.length
    ? (validSummaries.reduce((acc, s) => acc + getVal(s, 'reserve_margin'), 0) / validSummaries.length).toFixed(1)
    : '0'
  const avgRainfall = validSummaries.length
    ? (validSummaries.reduce((acc, s) => acc + getVal(s, 'rainfall'), 0) / validSummaries.length).toFixed(1)
    : '0'

  const topAqi = [...validSummaries]
    .sort((a, b) => getVal(b, 'aqi') - getVal(a, 'aqi'))
    .slice(0, 5)

  const lowReservoir = [...validSummaries]
    .filter(s => getVal(s, 'reservoir_storage') > 0)
    .sort((a, b) => getVal(a, 'reservoir_storage') - getVal(b, 'reservoir_storage'))
    .slice(0, 5)

  const SEV_MAP: Record<string, 'low' | 'medium' | 'high' | 'danger'> = {
    low: 'low', medium: 'medium', high: 'high', critical: 'danger',
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Cities Insight</h2>
        <p className="text-slate-300 text-lg mb-1">Taiwan Urban Data Platform</p>
        <p className="text-slate-400 text-sm">探索台灣各縣市的環境、能源、水資源與經濟趨勢</p>
        <div className="flex gap-3 mt-6">
          <Link href="/cities" className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            探索城市
          </Link>
          <Link href="/compare" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            城市比較
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">全台關鍵指標</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard label="全台平均 AQI" value={avgAqi} icon={Wind} color="amber"
            status={avgAqi > 100 ? 'danger' : avgAqi > 50 ? 'warning' : 'good'} />
          <MetricCard label="全台即時用電" value={totalElectricity > 0 ? (totalElectricity / 1000).toFixed(1) : '-'} unit="GW" icon={Zap} color="sky" />
          <MetricCard label="平均降雨量" value={avgRainfall} unit="mm" icon={CloudRain} color="violet" />
          <MetricCard label="水庫平均蓄水率" value={avgReservoir} unit="%" icon={Droplets} color="emerald"
            status={Number(avgReservoir) < 50 ? 'danger' : Number(avgReservoir) < 70 ? 'warning' : 'good'} />
          <MetricCard label="平均備轉容量" value={avgMargin} unit="%" icon={Activity} color="emerald"
            status={Number(avgMargin) < 6 ? 'danger' : Number(avgMargin) < 10 ? 'warning' : 'good'} />
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">AQI 最高城市 Top 5</h3>
          <div className="space-y-2">
            {topAqi.map((s, i) => {
              const aqi = getVal(s, 'aqi')
              return (
                <div key={s.city.code} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</span>
                  <Link href={`/cities/${s.city.code}`} className="flex-1 text-sm font-medium text-slate-700 hover:text-sky-600">
                    {s.city.name_zh}
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, aqi)}%` }} />
                    </div>
                    <span className={`text-sm font-semibold w-10 text-right ${aqi > 100 ? 'text-red-600' : aqi > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {Math.round(aqi)}
                    </span>
                  </div>
                </div>
              )
            })}
            {topAqi.length === 0 && <p className="text-slate-400 text-sm text-center py-4">暫無資料</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">水庫蓄水率最低城市 Top 5</h3>
          <div className="space-y-2">
            {lowReservoir.map((s, i) => {
              const rv = getVal(s, 'reservoir_storage')
              return (
                <div key={s.city.code} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</span>
                  <Link href={`/cities/${s.city.code}`} className="flex-1 text-sm font-medium text-slate-700 hover:text-sky-600">
                    {s.city.name_zh}
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${rv < 50 ? 'bg-red-400' : 'bg-sky-400'}`} style={{ width: `${rv}%` }} />
                    </div>
                    <span className={`text-sm font-semibold w-12 text-right ${rv < 50 ? 'text-red-600' : 'text-sky-600'}`}>
                      {rv.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
            {lowReservoir.length === 0 && <p className="text-slate-400 text-sm text-center py-4">暫無資料</p>}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">最近異常</h3>
          <Link href="/alerts" className="text-sky-500 text-sm hover:underline">查看全部</Link>
        </div>
        <div className="space-y-2">
          {alerts.map(a => (
            <AlertCard key={a.id}
              city={a.city_name_zh || '全台'}
              message={a.message || a.title}
              severity={SEV_MAP[a.severity] ?? 'low'}
              time={a.created_at?.slice(0, 16) ?? ''} />
          ))}
          {alerts.length === 0 && <p className="text-slate-400 text-sm text-center py-4">目前無告警</p>}
        </div>
      </div>
    </div>
  )
}
