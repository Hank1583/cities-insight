export const runtime = 'edge';
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { apiFetch, ApiIndicator, ApiTimeSeries } from '@/lib/api/client'
import LineTrendChart from '@/components/charts/LineTrendChart'
import BarRankingChart from '@/components/charts/BarRankingChart'

// 全國性指標：所有縣市儲存相同值（全台電網統計），排行無意義
const NATIONAL_INDICATORS = ['electricity_load', 'reserve_margin']

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
    const isMonthly = indicatorCode === 'electricity_monthly'
    const seriesUrl = isMonthly
      ? `/cities/taipei/indicators/${indicatorCode}?range=365d&granularity=month`
      : `/cities/taipei/indicators/${indicatorCode}?range=30d&granularity=day`
    series = await apiFetch<ApiTimeSeries[]>(seriesUrl)
  } catch { series = [] }

  try {
    ranking = await apiFetch<ApiRankingItem[]>(`/indicators/${indicatorCode}/ranking`)
  } catch { ranking = [] }

  const isNational = NATIONAL_INDICATORS.includes(indicatorCode)
  const isMonthly  = indicatorCode === 'electricity_monthly'

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

      {isNational && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-semibold">全國性指標</span>：此指標為全台電網統計數字，並非各縣市個別量測值，因此所有縣市顯示相同數值。
            不提供城市排行。
          </div>
        </div>
      )}

      {series.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">
            {isNational ? '全國趨勢' : '台北市趨勢'} —
            {isMonthly ? ' 近 12 個月' : ' 近 30 天'}
          </h3>
          <LineTrendChart data={series} label={indicator.name_zh} unit={indicator.unit} color="#0ea5e9" />
        </div>
      )}

      {rankingChartData.length > 0 && !isNational && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">各城市最新值排行</h3>
          <BarRankingChart data={rankingChartData} unit={indicator.unit} horizontal color="#0ea5e9" />
        </div>
      )}
    </div>
  )
}
