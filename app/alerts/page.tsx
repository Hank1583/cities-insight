'use client'
import { useState, useEffect, useCallback } from 'react'
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Clock, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { apiFetch, ApiCity, ApiIndicator } from '@/lib/api/client'

// 可設定警示的指標（有實際資料的）
const ALERTABLE_INDICATORS = ['aqi', 'pm25', 'weather_temp', 'rainfall', 'reservoir_storage', 'electricity_monthly', 'earthquake_count']

const OP_LABELS: Record<string, string> = { gt: '高於', lt: '低於', gte: '高於等於', lte: '低於等於' }

interface AlertRule {
  id: number
  cityCode: string; cityName: string
  indicatorCode: string; indicatorName: string; unit: string
  conditionOp: string; threshold: number
  cooldownHours: number; isActive: boolean
  lastTriggeredAt: string | null; createdAt: string
}

interface AlertLog {
  id: number
  cityName: string; indicatorName: string; unit: string
  conditionOp: string; threshold: number; triggeredValue: number
  sentAt: string
}

export default function AlertsPage() {
  const [userId, setUserId]         = useState('')
  const [inputId, setInputId]       = useState('')
  const [rules, setRules]           = useState<AlertRule[]>([])
  const [logs, setLogs]             = useState<AlertLog[]>([])
  const [cities, setCities]         = useState<ApiCity[]>([])
  const [indicators, setIndicators] = useState<ApiIndicator[]>([])
  const [tab, setTab]               = useState<'rules'|'logs'|'guide'>('guide')
  const [loading, setLoading]       = useState(false)

  // 新增表單
  const [form, setForm] = useState({ city: '', indicator: 'aqi', op: 'gt', threshold: '', cooldown: '4' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    apiFetch<ApiCity[]>('/cities').then(setCities)
    apiFetch<ApiIndicator[]>('/indicators').then(data =>
      setIndicators(data.filter(i => ALERTABLE_INDICATORS.includes(i.code)))
    )
    // 從 localStorage 讀上次輸入的 ID
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lineUserId') : ''
    if (saved) { setUserId(saved); setInputId(saved) }
  }, [])

  const loadData = useCallback(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      apiFetch<AlertRule[]>(`/alerts?line_user_id=${encodeURIComponent(userId)}`),
      apiFetch<AlertLog[]>(`/alerts/logs?line_user_id=${encodeURIComponent(userId)}&limit=30`),
    ]).then(([r, l]) => {
      setRules(r); setLogs(l); setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  useEffect(() => { if (userId) loadData() }, [userId, loadData])

  function confirmId() {
    const id = inputId.trim()
    if (!id) return
    localStorage.setItem('lineUserId', id)
    setUserId(id)
    setTab('rules')
  }

  async function addRule() {
    if (!form.city || !form.threshold || !userId) return
    setAdding(true)
    try {
      await apiFetch('/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_user_id:   userId,
          city_code:      form.city,
          indicator_code: form.indicator,
          condition_op:   form.op,
          threshold:      parseFloat(form.threshold),
          cooldown_hours: parseInt(form.cooldown),
        }),
      })
      setForm(f => ({ ...f, threshold: '' }))
      loadData()
    } catch { /* error */ }
    setAdding(false)
  }

  async function deleteRule(id: number) {
    await apiFetch(`/alerts/${id}?line_user_id=${encodeURIComponent(userId)}`, { method: 'DELETE' })
    loadData()
  }

  async function toggleRule(id: number) {
    await apiFetch(`/alerts/${id}/toggle?line_user_id=${encodeURIComponent(userId)}`, { method: 'PUT' })
    loadData()
  }

  const activeCount = rules.filter(r => r.isActive).length

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="LINE 警示設定" subtitle="設定條件，達標時自動推播 LINE 通知" />

      {/* LINE User ID 輸入區 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare className="w-5 h-5 text-sky-500" />
          <h3 className="font-semibold text-slate-700">你的 LINE User ID</h3>
          {userId && <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">已綁定</span>}
        </div>
        <div className="flex gap-2">
          <input
            value={inputId} onChange={e => setInputId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmId()}
            placeholder="貼上你的 LINE User ID（Uxxxxxxxxxxxx）"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          />
          <button onClick={confirmId}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">
            確認
          </button>
        </div>
        {!userId && (
          <p className="text-xs text-slate-400 mt-2">
            不知道 ID？加 LINE Bot 好友後傳「ID」，Bot 會回覆你的 User ID。
          </p>
        )}
      </div>

      {/* Tab */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([['guide','使用說明'],['rules','警示規則'],['logs','推播記錄']] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {k === 'rules' && userId ? `${l} (${activeCount})` : l}
          </button>
        ))}
      </div>

      {/* 使用說明 */}
      {tab === 'guide' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center gap-4">
          <MessageSquare className="w-10 h-10 text-sky-500" />
          <p className="text-slate-600 text-sm text-center">請先完成 LINE 會員綁定，即可使用警示推播功能。</p>
          <a
            href="https://www.highlight.url.tw/line_bot/member_bind.php"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            前往 LINE 會員綁定
          </a>
        </div>
      )}

      {/* 警示規則管理 */}
      {tab === 'rules' && userId && (
        <div className="space-y-4">
          {/* 新增規則 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> 新增警示規則
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400">
                <option value="">選擇縣市</option>
                {cities.map(c => <option key={c.code} value={c.code}>{c.name_zh}</option>)}
              </select>
              <select value={form.indicator} onChange={e => setForm(f => ({ ...f, indicator: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400">
                {indicators.map(i => <option key={i.code} value={i.code}>{i.name_zh}</option>)}
              </select>
              <select value={form.op} onChange={e => setForm(f => ({ ...f, op: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400">
                {Object.entries(OP_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="number" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                placeholder="門檻值"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400" />
              <select value={form.cooldown} onChange={e => setForm(f => ({ ...f, cooldown: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400">
                {[[1,'1 小時'],[2,'2 小時'],[4,'4 小時'],[8,'8 小時'],[24,'24 小時']].map(([v,l]) => (
                  <option key={v} value={v}>{l}後可再通知</option>
                ))}
              </select>
              <button onClick={addRule} disabled={adding || !form.city || !form.threshold}
                className="bg-sky-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />{adding ? '新增中...' : '新增規則'}
              </button>
            </div>
          </div>

          {/* 規則列表 */}
          {loading ? (
            <div className="flex items-center justify-center h-24 text-slate-400">
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2" />載入中...
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>尚未設定任何警示規則</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-opacity ${rule.isActive ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{rule.cityName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">{rule.indicatorName}</span>
                      <span className="text-sky-600 font-medium">{OP_LABELS[rule.conditionOp]}</span>
                      <span className="font-bold text-slate-800">{rule.threshold} {rule.unit}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />冷卻 {rule.cooldownHours}h</span>
                      {rule.lastTriggeredAt && <span>上次觸發：{rule.lastTriggeredAt.slice(0,16)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleRule(rule.id)} title={rule.isActive ? '停用' : '啟用'}
                      className="text-slate-400 hover:text-sky-500 transition-colors">
                      {rule.isActive
                        ? <ToggleRight className="w-6 h-6 text-sky-500" />
                        : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button onClick={() => deleteRule(rule.id)} title="刪除"
                      className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 推播記錄 */}
      {tab === 'logs' && userId && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-24 text-slate-400">
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2" />載入中...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>尚無推播記錄</p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="bg-white rounded-xl border border-amber-200 p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{log.cityName}</span>
                    <span className="text-slate-500">{log.indicatorName}</span>
                    <span className="text-amber-600 font-bold">{log.triggeredValue} {log.unit}</span>
                    <span className="text-slate-400 text-xs">（門檻 {OP_LABELS[log.conditionOp]} {log.threshold}）</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{log.sentAt?.slice(0, 16)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 未輸入 ID 時的提示 */}
      {tab !== 'guide' && !userId && (
        <div className="text-center py-16 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>請先輸入你的 LINE User ID</p>
          <button onClick={() => setTab('guide')} className="mt-3 text-sky-500 text-sm hover:underline">
            查看使用說明
          </button>
        </div>
      )}
    </div>
  )
}
