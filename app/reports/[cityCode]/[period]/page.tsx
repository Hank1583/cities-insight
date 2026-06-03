import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar, BarChart2 } from 'lucide-react'
import { apiFetch, ApiReport, ApiReportDetail, ApiReportIndicator } from '@/lib/api/client'
import ReportActions from './ReportActions'

// ── 靜態預生成 ────────────────────────────────────

export async function generateStaticParams() {
  try {
    const reports = await apiFetch<ApiReport[]>('/reports?type=monthly&limit=200')
    return reports
      .filter(r => r.city_code && r.period_start)
      .map(r => ({
        cityCode: r.city_code!,
        period:   r.period_start!.slice(0, 7), // "2026-05-01" → "2026-05"
      }))
  } catch {
    return []
  }
}

// ── Metadata ──────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ cityCode: string; period: string }> }
): Promise<Metadata> {
  const { cityCode, period } = await params
  const [year, month] = period.split('-')
  const label = `${year}年${parseInt(month)}月`

  try {
    const reports = await apiFetch<ApiReport[]>(
      `/reports?type=monthly&city_code=${cityCode}&period_start=${period}-01`
    )
    const cityName = reports[0]?.city_name_zh ?? cityCode
    return {
      title: `${cityName} ${label} 月報 | Cities Insight`,
      description: `${cityName} ${label} 環境、能源、水資源指標趨勢分析報告，含 AQI、降雨量、水庫蓄水率、備轉容量率等數據。`,
      openGraph: {
        title: `${cityName} ${label} 月報 | Cities Insight`,
        description: `${cityName} ${label} 環境數據月報`,
        url: `https://cities.highlightsignal.com/reports/${cityCode}/${period}`,
      },
    }
  } catch {
    return { title: `${cityCode} ${label} 月報 | Cities Insight` }
  }
}

// ── 輔助元件 ──────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up')   return <TrendingUp   className="w-4 h-4 text-rose-500" />
  if (trend === 'down') return <TrendingDown  className="w-4 h-4 text-emerald-500" />
  return <Minus className="w-4 h-4 text-slate-400" />
}

function LevelBadge({ level }: { level: string | null }) {
  if (!level) return null
  const map: Record<string, { label: string; cls: string }> = {
    good:               { label: '良好',   cls: 'bg-emerald-100 text-emerald-700' },
    moderate:           { label: '普通',   cls: 'bg-yellow-100  text-yellow-700' },
    unhealthy_sensitive:{ label: '敏感族群不健康', cls: 'bg-orange-100 text-orange-700' },
    unhealthy:          { label: '不健康', cls: 'bg-rose-100   text-rose-700' },
    warning:            { label: '警示',   cls: 'bg-amber-100  text-amber-700' },
    critical:           { label: '危急',   cls: 'bg-red-100    text-red-700' },
  }
  const cfg = map[level]
  if (!cfg) return null
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function IndicatorCard({
  code, data, rank,
}: {
  code: string
  data: ApiReportIndicator
  rank?: { rank: number; total: number }
}) {
  const hasData = data.monthly_avg !== null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-700">{data.name_zh}</p>
          {data.unit && <p className="text-xs text-slate-400">{data.unit}</p>}
        </div>
        <LevelBadge level={data.level} />
      </div>

      {hasData ? (
        <>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {data.monthly_avg!.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500 mb-0.5">{data.unit}</span>
            <div className="ml-auto flex items-center gap-1">
              <TrendIcon trend={data.trend} />
              {data.change_pct !== null && (
                <span className={`text-sm font-medium ${
                  data.trend === 'up' ? 'text-rose-600' :
                  data.trend === 'down' ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {data.change_pct > 0 ? '+' : ''}{data.change_pct.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            {data.prev_avg !== null && (
              <p>上月平均：{data.prev_avg.toFixed(1)} {data.unit}</p>
            )}
            {data.peak_value !== null && (
              <p>本月最高：{data.peak_value.toFixed(1)} {data.unit}（{data.peak_date}）</p>
            )}
            <p>有效資料：{data.data_days} 天</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400">本月資料待更新</p>
      )}

      {rank && (
        <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
          全台排名 <span className="font-semibold text-slate-700">{rank.rank}</span> / {rank.total}
        </div>
      )}
    </div>
  )
}

// ── 主頁面 ────────────────────────────────────────

export default async function MonthlyReportPage(
  { params }: { params: Promise<{ cityCode: string; period: string }> }
) {
  const { cityCode, period } = await params
  const [year, month] = period.split('-')
  const label = `${year}年${parseInt(month)}月`

  let report: ApiReportDetail | null = null

  try {
    const list = await apiFetch<ApiReport[]>(
      `/reports?type=monthly&city_code=${cityCode}&period_start=${period}-01`
    )
    if (list[0]) {
      report = await apiFetch<ApiReportDetail>(`/reports/${list[0].id}`)
    }
  } catch { /* 顯示錯誤狀態 */ }

  if (!report) {
    return (
      <div className="max-w-4xl space-y-4">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600">
          <ArrowLeft className="w-4 h-4" /> 返回月報列表
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">查無 {cityCode} {label} 月報資料</p>
        </div>
      </div>
    )
  }

  const c = report.content
  const INDICATOR_ORDER = ['aqi', 'pm25', 'weather_temp', 'rainfall', 'reservoir_storage', 'electricity_monthly', 'reserve_margin']

  return (
    <div className="max-w-4xl space-y-6">

      {/* 麵包屑 */}
      <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回月報列表
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-2 text-sky-200 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>{c.period.label} 月報</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{c.city.name_zh}</h1>
        {c.summary.headline ? (
          <p className="text-sky-100 text-lg">{c.summary.headline}</p>
        ) : (
          <p className="text-sky-200 text-sm">環境、能源、水資源指標趨勢分析</p>
        )}
        <div className="mt-4 flex gap-4 text-sm text-sky-200">
          <span>報告期間：{report.period_start} ～ {report.period_end}</span>
          {c.summary.alert_count > 0 && (
            <span className="flex items-center gap-1 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              本月警示 {c.summary.alert_count} 次
            </span>
          )}
        </div>
      </div>

      {/* 指標卡片 */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-sky-500" />
          各項指標月均值
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDICATOR_ORDER.map(code => {
            const data = c.indicators[code]
            if (!data) return null
            return (
              <IndicatorCard
                key={code}
                code={code}
                data={data}
                rank={c.rankings[code]}
              />
            )
          })}
        </div>
      </section>

      {/* 警示摘要 */}
      {c.alerts_summary.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 本月警示紀錄
          </h2>
          <ul className="space-y-2">
            {c.alerts_summary.map((a, i) => (
              <li key={i} className="text-sm text-amber-700">
                {a.indicator_name_zh} — 觸發 {a.count} 次
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 訂閱 + 下載 */}
      <ReportActions cityCode={cityCode} cityName={c.city.name_zh} />

      {/* 城市連結 */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={`/cities/${cityCode}`}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          查看 {c.city.name_zh} 即時數據
        </Link>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 border border-slate-300 hover:border-sky-400 text-slate-600 hover:text-sky-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          其他城市月報
        </Link>
      </div>

      {/* SEO 結構化資料 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Report',
            name: report.title,
            datePublished: report.created_at,
            about: {
              '@type': 'Place',
              name: c.city.name_zh,
              addressCountry: 'TW',
            },
            temporalCoverage: `${report.period_start}/${report.period_end}`,
            publisher: {
              '@type': 'Organization',
              name: 'Cities Insight',
              url: 'https://cities.highlightsignal.com',
            },
          }),
        }}
      />
    </div>
  )
}
