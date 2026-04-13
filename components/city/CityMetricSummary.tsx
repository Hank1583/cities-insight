import { Wind, Thermometer, CloudRain, Droplets, Zap, Activity, AlertTriangle } from 'lucide-react'
import { CitySummary } from '@/types/city'

interface Props { metrics: CitySummary['metrics'] }

function MetricBadge({ label, value, unit, icon: Icon, color }: {
  label: string; value: number; unit: string; icon: React.ElementType; color: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl font-bold text-slate-800">{typeof value === 'number' ? value.toFixed(value > 100 ? 0 : 1) : value}<span className="text-sm font-normal text-slate-500 ml-1">{unit}</span></div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

export default function CityMetricSummary({ metrics }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-700 mb-4">指標摘要</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <MetricBadge label="AQI" value={metrics.aqi} unit="" icon={Wind} color="bg-amber-50 text-amber-600" />
        <MetricBadge label="PM2.5" value={metrics.pm25} unit="μg/m³" icon={AlertTriangle} color="bg-orange-50 text-orange-600" />
        <MetricBadge label="氣溫" value={metrics.temperature} unit="°C" icon={Thermometer} color="bg-red-50 text-red-500" />
        <MetricBadge label="降雨量" value={metrics.rainfall} unit="mm" icon={CloudRain} color="bg-violet-50 text-violet-600" />
        <MetricBadge label="水庫蓄水" value={metrics.reservoir_storage} unit="%" icon={Droplets} color="bg-sky-50 text-sky-600" />
        <MetricBadge label="用電" value={metrics.electricity_load} unit="MW" icon={Zap} color="bg-yellow-50 text-yellow-600" />
        <MetricBadge label="備轉容量" value={metrics.reserve_margin} unit="%" icon={Activity} color="bg-emerald-50 text-emerald-600" />
      </div>
    </div>
  )
}
