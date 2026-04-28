'use client'
import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Users, Maximize2, Clock, ArrowLeft } from 'lucide-react'
import { apiFetch, ApiSummary, ApiTimeSeries } from '@/lib/api/client'
import CityMetricSummary from '@/components/city/CityMetricSummary'
import CityIndicatorTabs from '@/components/city/CityIndicatorTabs'

export default function CityPage() {
  const params = useParams()
  const cityCode = params?.cityCode as string

  const [data, setData] = useState<ApiSummary | null>(null)
  const [series, setSeries] = useState({
    aqi: [] as ApiTimeSeries[],
    temp: [] as ApiTimeSeries[],
    rainfall: [] as ApiTimeSeries[],
    reservoir: [] as ApiTimeSeries[],
    electricity: [] as ApiTimeSeries[],
    margin: [] as ApiTimeSeries[],
    electricityMonthly: [] as ApiTimeSeries[],
  })
  const [loading, setLoading] = useState(true)
  const [notFoundError, setNotFoundError] = useState(false)

  useEffect(() => {
    if (!cityCode) return
    setLoading(true)
    setNotFoundError(false)

    apiFetch<ApiSummary>(`/cities/${cityCode}/summary`)
      .then(async (summary) => {
        setData(summary)
        const [aqi, temp, rainfall, reservoir, electricity, margin, electricityMonthly] =
          await Promise.all([
            apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/aqi?range=30d&granularity=day`).catch(() => []),
            apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/weather_temp?range=30d&granularity=day`).catch(() => []),
            apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/rainfall?range=30d&granularity=day`).catch(() => []),
            apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/reservoir_storage?range=30d&granularity=day`).catch(() => []),
            apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/electricity_load?range=30d&granularity=day`).catch(() => []),
            apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/reserve_margin?range=30d&granularity=day`).catch(() => []),
            apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/electricity_monthly?range=365d&granularity=month`).catch(() => []),
          ])
        setSeries({ aqi, temp, rainfall, reservoir, electricity, margin, electricityMonthly })
      })
      .catch(() => setNotFoundError(true))
      .finally(() => setLoading(false))
  }, [cityCode])

  if (notFoundError) return notFound()

  const city = data?.city
  const metrics = data?.metrics

  const metricsForCard = {
    aqi:                 metrics?.aqi?.value ?? 0,
    pm25:                metrics?.pm25?.value ?? 0,
    temperature:         metrics?.weather_temp?.value ?? 0,
    rainfall:            metrics?.rainfall?.value ?? 0,
    reservoir_storage:   metrics?.reservoir_storage?.value ?? 0,
    electricity_load:    metrics?.electricity_load?.value ?? 0,
    reserve_margin:      metrics?.reserve_margin?.value ?? 0,
    electricity_monthly: metrics?.electricity_monthly?.value ?? 0,
  }

  return (
    <div className="max-w-7xl space-y-6">
      <Link href="/cities" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回城市列表
      </Link>

      {loading && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-2xl p-6 h-40 animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-20 animate-pulse bg-slate-100" />
            ))}
          </div>
        </div>
      )}

      {!loading && city && (
        <>
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-1">{city.name_zh}</h2>
                <p className="text-slate-400 text-lg">{city.name_en}</p>
              </div>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-sm font-mono text-slate-300">{city.code}</span>
            </div>
            <div className="flex flex-wrap gap-5 mt-5 text-sm text-slate-300">
              {city.population > 0 && <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{city.population.toLocaleString()} 人</div>}
              {city.area > 0 && <div className="flex items-center gap-2"><Maximize2 className="w-4 h-4 text-slate-400" />{city.area.toLocaleString()} km²</div>}
              {city.lat && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{city.lat}, {city.lng}</div>}
              {data?.updatedAt && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />更新：{data.updatedAt.slice(0, 16)}</div>}
            </div>
          </div>

          <CityMetricSummary metrics={metricsForCard} />

          <CityIndicatorTabs
            cityCode={cityCode}
            aqiSeries={series.aqi}
            tempSeries={series.temp}
            rainfallSeries={series.rainfall}
            reservoirSeries={series.reservoir}
            electricitySeries={series.electricity}
            marginSeries={series.margin}
            electricityMonthlySeries={series.electricityMonthly}
          />
        </>
      )}
    </div>
  )
}
