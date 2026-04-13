import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { apiFetch, ApiIndicator, ApiTimeSeries } from '@/lib/api/client'
import LineTrendChart from '@/components/charts/LineTrendChart'
import BarRankingChart from '@/components/charts/BarRankingChart'

interface Props { params: Promise<{ indicatorCode: string }> }

interface ApiRankingItem {
  rank: number
  cityCode: string
  cityNameZh: string
  value: number
  updatedAt: string
}

const CAT_LABELS: Record<string, string> = {
  environment: '環境', water: '水資源', energy: '能源', economy: '經濟'
}

export default async function IndicatorPage({ params }: Props) {
  const { indicatorCode } = await params

  let indicator: ApiIndicator | null = null
  let series: ApiTimeSeries[] = []
  let ranking: ApiRankingItem[] = []

  try {
    indicator = await apiFetch<ApiIndicator>(`/indicators/${indicatorCode}`)
  } catch {
    notFound()
  }
  if (!indicator) notFound()

  try {
    // Use first available city for trend (or global — use taipei as representative)
    series = await apiFetch<ApiTimeSeries[]>(`/cities/taipei/indicators/${indicatorCode}?range=30d&granularity=day`)
  } catch { series = [] }

  try {
    ranking = await apiFetch<ApiRankingItem[]>(`/indicators/${indicatorCode}/ranking`)
  } catch { ranking = [] }

  const rankingChartData = ranking.slice(0, 10).map(r => ({
    label: r.cityNameZh,
    value: r.value,
  }))

  return (
    <div className="max-w-7xl space-y-6">
      <Link href="/indicators" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回指標列表
      </Link>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">{indicator.name_zh}</h2>
            {indicator.name_en && <p className="text-slate-400">{indicator.name_en}</p>}
          </div>
          <span className="bg-white/10 px-3 py-1.5 rounded-lg text-sm font-mono text-slate-300">{indicator.code}</span>
        </div>
        {indicator.description && <p className="text-slate-300 mt-3 text-sm">{indicator.description}</p>}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
          <span>類別：{CAT_LABELS[indicator.category_code] ?? indicator.category_name_zh}</span>
          <span>單位：{indicator.unit}</span>
          <span>更新頻率：{indicator.freq}</span>
          <span>資料來源：{indicator.source_name}</span>
        </div>
      </div>

      {series.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">台北市趨勢 — 近 30 天</h3>
          <LineTrendChart data={series} label={indicator.name_zh} unit={indicator.unit} color="#0ea5e9" />
        </div>
      )}

      {rankingChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">各城市最新值排行</h3>
          <BarRankingChart data={rankingChartData} unit={indicator.unit} horizontal color="#0ea5e9" />
        </div>
      )}
    </div>
  )
}
