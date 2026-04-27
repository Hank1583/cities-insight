'use client'
export const runtime = 'edge';
import { useState, useEffect } from 'react'
import { FileText, Send, Clock, CheckCircle, Download, Plus, Users } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { apiFetch, ApiReport, ApiSubscription } from '@/lib/api/client'

const STATUS_CONFIG = {
  sent:    { label: '已寄送', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  pending: { label: '待寄送', icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-100' },
  draft:   { label: '草稿',   icon: FileText,     color: 'text-slate-600',   bg: 'bg-slate-100' },
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'subscribers' | 'template'>('list')
  const [reports, setReports] = useState<ApiReport[]>([])
  const [subscribers, setSubscribers] = useState<ApiSubscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<ApiReport[]>('/reports'),
      apiFetch<ApiSubscription[]>('/reports/subscriptions'),
    ]).then(([r, s]) => {
      setReports(r)
      setSubscribers(s)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="週報管理" subtitle="城市指標週報寄送與訂閱管理"
        action={
          <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> 建立週報
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-sky-600">{reports.filter(r => r.status === 'sent').length}</div>
          <div className="text-sm text-slate-500 mt-1">已寄出週報</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{subscribers.length}</div>
          <div className="text-sm text-slate-500 mt-1">訂閱人數</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-600">{reports.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm text-slate-500 mt-1">待寄出</div>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
        {[['list','週報列表'],['subscribers','訂閱名單'],['template','模板預覽']].map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k as typeof activeTab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === k ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-slate-400">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2" />載入中...
        </div>
      ) : activeTab === 'list' ? (
        <div className="space-y-3">
          {reports.map(report => {
            const cfg = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
            const StatusIcon = cfg.icon
            return (
              <div key={report.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-800">{report.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />{cfg.label}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    {report.period_start && <span>期間：{report.period_start} ~ {report.period_end}</span>}
                    <span>建立：{report.created_at?.slice(0, 16)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.status === 'draft' && (
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-medium hover:bg-sky-400 transition-colors">
                      <Send className="w-3.5 h-3.5" /> 寄送
                    </button>
                  )}
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                    <Download className="w-3.5 h-3.5" /> 下載
                  </button>
                </div>
              </div>
            )
          })}
          {reports.length === 0 && <p className="text-center text-slate-400 py-8">暫無週報</p>}
        </div>
      ) : activeTab === 'subscribers' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Email','類型','城市','訂閱日期','操作'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{s.email}</td>
                  <td className="px-5 py-3 text-slate-500">{s.report_type}</td>
                  <td className="px-5 py-3 text-slate-500">{s.city_name_zh ?? '全台'}</td>
                  <td className="px-5 py-3 text-slate-500">{s.created_at?.slice(0, 10)}</td>
                  <td className="px-5 py-3">
                    <button className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">取消訂閱</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-slate-100">
            <button className="flex items-center gap-2 text-sky-500 hover:text-sky-700 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> 新增訂閱者
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">週報模板預覽</h3>
          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-4">
            <div className="text-center border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Cities Insight 城市指標週報</h2>
              <p className="text-slate-500 text-sm mt-1">Taiwan Urban Data Platform</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">本週重點摘要</h3>
              <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                <li>全台平均 AQI 與各縣市空氣品質狀況</li>
                <li>水庫蓄水率統計與警戒城市</li>
                <li>全台備轉容量率與供電穩定度</li>
              </ul>
            </div>
            <div className="text-xs text-slate-400 border-t border-slate-200 pt-3">
              © 2026 Cities Insight · 取消訂閱 | 查看完整報告
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
