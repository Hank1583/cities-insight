import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon: LucideIcon
  color?: string
  trend?: number
  status?: 'good' | 'warning' | 'danger' | 'neutral'
}

const STATUS_COLORS = {
  good: 'text-emerald-600 bg-emerald-50',
  warning: 'text-amber-600 bg-amber-50',
  danger: 'text-red-600 bg-red-50',
  neutral: 'text-sky-600 bg-sky-50',
}

export default function MetricCard({ label, value, unit, icon: Icon, color = 'sky', trend, status = 'neutral' }: MetricCardProps) {
  const iconClass = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
  }[color] ?? 'bg-sky-50 text-sky-600'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        {status !== 'neutral' && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
            {status === 'good' ? '正常' : status === 'warning' ? '注意' : '警戒'}
          </span>
        )}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 較昨日
        </div>
      )}
    </div>
  )
}
