'use client'
import { useState } from 'react'
import { Mail, Download, CheckCircle, Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/api/client'

interface Props {
  cityCode: string
  cityName: string
}

export default function ReportActions({ cityCode, cityName }: Props) {
  const [email, setEmail]       = useState('')
  const [subState, setSubState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [subMsg, setSubMsg]     = useState('')

  // ── 訂閱 ──────────────────────────────────────
  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubState('loading')
    try {
      await apiFetch('/reports/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city_code: cityCode, report_type: 'monthly' }),
      })
      setSubState('ok')
      setSubMsg(`已訂閱！每月 ${cityName} 月報將寄送至 ${email}`)
    } catch {
      setSubState('error')
      setSubMsg('訂閱失敗，請稍後再試')
    }
  }

  // ── 下載（瀏覽器列印為 PDF）──────────────────
  function handleDownload() {
    window.print()
  }

  return (
    <div className="space-y-4 print:hidden">

      {/* 訂閱區塊 */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-semibold text-sky-800">訂閱 {cityName} 月報</h3>
        </div>
        <p className="text-xs text-sky-600 mb-3">每月自動寄送環境數據分析報告至您的信箱</p>

        {subState === 'ok' ? (
          <div className="flex items-center gap-2 text-emerald-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            {subMsg}
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 text-sm border border-sky-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
            />
            <button
              type="submit"
              disabled={subState === 'loading'}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {subState === 'loading'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : '訂閱'
              }
            </button>
          </form>
        )}

        {subState === 'error' && (
          <p className="text-xs text-rose-600 mt-2">{subMsg}</p>
        )}
      </div>

      {/* 下載按鈕 */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:border-sky-400 text-slate-600 hover:text-sky-600 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        下載月報（PDF）
      </button>

    </div>
  )
}
