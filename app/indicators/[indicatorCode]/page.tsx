'use client'
import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { apiFetch, ApiIndicator, ApiTimeSeries } from '@/lib/api/client'
import IndicatorCharts from '@/components/charts/IndicatorCharts'

const NATIONAL_INDICATORS = ['electricity_load', 'reserve_margin']

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

export default function IndicatorPage() {
  const params = useParams()
  const indicatorCode = params?.indicatorCode as string

  const [indicator, setIndicator] = useState<ApiIndicator | null>(null)
  const [series, setSeries] = useState<ApiTimeSeries[]>([])
  const [ranking, setRanking] = useState<ApiRankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundError, setNotFoundError] = useState(false)

  useEffect(() => {
    if (!indicatorCode) return
    setLoading(true)
    setNotFoundError(false)

    apiFetch<ApiIndicator>(`/indicators/${indicatorCode}`)
      .then(async (ind) => {
        setIndicator(ind)
        const isMonthly = indicatorCode === 'electricity_monthly'
        const seriesUrl = isMonthly
          ? `/cities/taipei/indicators/${indicatorCode}?range=365d&granularity=month`
          : `/cities/taipei/indicators/${indicatorCode}?range=30d&granularity=day`
        const [s, r] = await Promise.all([
          apiFetch<ApiTimeSeries[]>(seriesUrl).catch(() => []),
          apiFetch<ApiRankingItem[]>(`/indicators/${indicatorCode}/ranking`).catch(() => []),
        ])
        setSeries(s)
        setRanking(r)
      })
      .catch(() => setNotFoundError(true))
      .finally(() => setLoading(false))
  }, [indicatorCode])

  if (notFoundError) return notFound()

  const isNational = NATIONAL_INDICATORS.includes(indicatorCode)
  const isMonthly = indicatorCode === 'electricity_monthly'

  const rankingChartData = ranking.slice(0, 10).map(r => ({
    label: r.cityNameZh,
    value: r.value,
  }))

  return (
    <div className="max-w-7xl space-y-6">
      <Link href="/indicators" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回指標列表
      </Link>

      {loading && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-2xl p-6 h-32 animate-pulse" />
          <div className="bg-white rounded-xl border border-slate-200 p-5 h-64 animate-pulse bg-slate-100" />
        </div>
      )}

      {!loading && indicator && (
        <>
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
                <span className="font-semibold">全國性指標</span>：此指標為全台電網統計數字，並非各縣市個別量測值，因此所有縣市顯示相同數值。不提供城市排行。
              </div>
            </div>
          )}

          <IndicatorCharts
            series={series}
            rankingData={rankingChartData}
            indicatorNameZh={indicator.name_zh}
            unit={indicator.unit}
            isNational={isNational}
            isMonthly={isMonthly}
          />
        </>
      )}
    </div>
  )
}
