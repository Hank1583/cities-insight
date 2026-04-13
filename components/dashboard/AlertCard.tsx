import { AlertTriangle, Info, XCircle } from 'lucide-react'

interface AlertCardProps {
  city: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical' | 'danger'
  time: string
}

const SEV_CONFIG = {
  low: { icon: Info, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: '資訊' },
  medium: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: '注意' },
  high: { icon: AlertTriangle, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: '高' },
  critical: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: '緊急' },
  danger: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: '緊急' },
}

export default function AlertCard({ city, message, severity, time }: AlertCardProps) {
  const { icon: Icon, bg, text, border, label } = SEV_CONFIG[severity]
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${bg} ${border}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${text}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${text}`}>[{label}]</span>
          <span className="text-xs font-medium text-slate-700">{city}</span>
        </div>
        <p className="text-sm text-slate-600 mt-0.5">{message}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  )
}
