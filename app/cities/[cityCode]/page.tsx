import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Users, Maximize2, Clock, ArrowLeft } from 'lucide-react'
import { apiFetch, ApiSummary, ApiTimeSeries } from '@/lib/api/client'
import CityMetricSummary from '@/components/city/CityMetricSummary'
import CityIndicatorTabs from '@/components/city/CityIndicatorTabs'

interface Props { params: Promise<{ cityCode: string }> }

async function fetchSeries(cityCode: string, indicator: string): Promise<ApiTimeSeries[]> {
  try {
    return await apiFetch<ApiTimeSeries[]>(`/cities/${cityCode}/indicators/${indicator}?range=30d&granularity=day`)
  } catch {
    return []
  }
}

export default async function CityPage({ params }: Props) {
  const { cityCode } = await params

  let data: ApiSummary | null = null
  try {
    data = await apiFetch<ApiSummary>(`/cities/${cityCode}/summary`)
  } catch {
    notFound()
  }
  if (!data) notFound()

  const city = data.city
  const metrics = data.metrics

  const [aqiSeries, tempSeries, rainfallSeries, reservoirSeries, electricitySeries, marginSeries] =
    await Promise.all([
      fetchSeries(cityCode, 'aqi'),
      fetchSeries(cityCode, 'weather_temp'),
      fetchSeries(cityCode, 'rainfall'),
      fetchSeries(cityCode, 'reservoir_storage'),
      fetchSeries(cityCode, 'electricity_load'),
      fetchSeries(cityCode, 'reserve_margin'),
    ])

  const metricsForCard = {
    aqi:               metrics.aqi?.value ?? 0,
    pm25:              metrics.pm25?.value ?? 0,
    temperature:       metrics.weather_temp?.value ?? 0,
    rainfall:          metrics.rainfall?.value ?? 0,
    reservoir_storage: metrics.reservoir_storage?.value ?? 0,
    electricity_load:  metrics.electricity_load?.value ?? 0,
    reserve_margin:    metrics.reserve_margin?.value ?? 0,
  }

  return (
    <div className="max-w-7xl space-y-6">
      <Link href="/cities" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回城市列表
      </Link>

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
          {data.updatedAt && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />更新：{data.updatedAt.slice(0, 16)}</div>}
        </div>
      </div>

      <CityMetricSummary metrics={metricsForCard} />

      <CityIndicatorTabs
        aqiSeries={aqiSeries}
        tempSeries={tempSeries}
        rainfallSeries={rainfallSeries}
        reservoirSeries={reservoirSeries}
        electricitySeries={electricitySeries}
        marginSeries={marginSeries}
      />
    </div>
  )
}
