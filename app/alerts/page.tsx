'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, XCircle, Info, CheckCircle, Filter } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { apiFetch, ApiAlertLog } from '@/lib/api/client'

const SEV_CONFIG = {
  low:      { icon: Info,          bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200',    badge: 'bg-sky-100 text-sky-700',    label: '資訊' },
  medium:   { icon: AlertTriangle, bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',  label: '注意' },
  high:     { icon: AlertTriangle, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', label: '高' },
  critical: { icon: XCircle,       bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    label: '緊急' },
  warning:  { icon: AlertTriangle, bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',  label: '警告' },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ApiAlertLog[]>([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const params = new URLSearchParams()
    if (severityFilter !== 'all') params.set('severity', severityFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    params.set('limit', '50')
    setLoading(true)
    apiFetch<ApiAlertLog[]>(`/alerts/logs?${params.toString()}`)
      .then(data => { setAlerts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [severityFilter, statusFilter])

  const activeCount = alerts.filter(a => a.status === 'open').length

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="示警紀錄" subtitle={`${activeCount} 個進行中的告警`} />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '進行中', count: alerts.filter(a => a.status === 'open').length,     color: 'text-red-600',     bg: 'bg-red-50' },
          { label: '緊急',   count: alerts.filter(a => a.severity === 'critical').length, color: 'text-red-600',     bg: 'bg-red-50' },
          { label: '高風險', count: alerts.filter(a => a.severity === 'high').length,     color: 'text-orange-600',  bg: 'bg-orange-50' },
          { label: '已解除', count: alerts.filter(a => a.status === 'closed').length,     color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-sm text-slate-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-2">
          {['all','critical','high','medium','low'].map(v => {
            const cfg = SEV_CONFIG[v as keyof typeof SEV_CONFIG]
            return (
              <button key={v} onClick={() => setSeverityFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${severityFilter === v ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {v === 'all' ? '全部嚴重度' : cfg?.label ?? v}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 ml-4">
          {[['all','全部狀態'],['open','進行中'],['closed','已解除']].map(([v,l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === v ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-slate-400">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2" />載入中...
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const cfg = SEV_CONFIG[alert.severity as keyof typeof SEV_CONFIG] ?? SEV_CONFIG.low
            const Icon = cfg.icon
            return (
              <div key={alert.id} className={`bg-white rounded-xl border ${cfg.border} p-5 flex gap-4`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                    <span className="font-semibold text-slate-800">{alert.city_name_zh || '全台'}</span>
                    <span className="text-sm text-slate-500">{alert.indicator_name_zh}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${alert.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {alert.status === 'open' ? '進行中' : '已解除'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{alert.message || alert.title}</p>
                  {(alert.trigger_value != null || alert.threshold_value != null) && (
                    <p className="text-xs text-slate-500 mt-1">
                      當前值：{alert.trigger_value} {alert.unit}，門檻：{alert.threshold_value} {alert.unit}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{alert.created_at?.slice(0, 16)}</p>
                </div>
              </div>
            )
          })}
          {alerts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
              <p>目前無告警記錄</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
