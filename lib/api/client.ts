const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://www.highlight.url.tw/cities-insight/api'

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' })

  const text = await res.text()
  console.log('API response:', text)

  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  
  return JSON.parse(text)
}

// ── Types matching PHP API responses (snake_case) ──────────────

export interface ApiCity {
  id: number
  code: string
  name_zh: string
  name_en: string
  city_type: string
  population: number
  area: number
  lat: number
  lng: number
  sort_order: number
}

export interface ApiMetricValue {
  value: number | null
  value_text: string | null
  updated_at: string
}

export interface ApiSummary {
  city: ApiCity
  updatedAt: string
  metrics: Record<string, ApiMetricValue>
}

export interface ApiIndicator {
  id: number
  code: string
  name_zh: string
  name_en: string
  description: string | null
  unit: string
  freq: string
  category_code: string
  category_name_zh: string
  source_name: string
  source_url: string | null
  latestDataAt?: string
}

export interface ApiTimeSeries {
  time: string
  value: number
}

export interface ApiCompare {
  indicator: { code: string; nameZh: string; unit: string }
  range: number
  granularity: string
  cities: { code: string; nameZh: string; nameEn: string }[]
  series: Record<string, ApiTimeSeries[]>
}

export interface ApiAlertLog {
  id: number
  status: string
  severity: string
  title: string
  message: string
  trigger_value: number
  threshold_value: number
  stat_time: string
  created_at: string
  indicator_code: string
  indicator_name_zh: string
  unit: string
  city_code: string
  city_name_zh: string
  rule_code: string
  rule_name: string
  condition_type: string
}

export interface ApiReport {
  id: number
  report_type: string
  title: string
  period_start: string
  period_end: string
  status: string
  sent_at: string | null
  created_at: string
  city_code: string | null
  city_name_zh: string | null
}

export interface ApiSubscription {
  id: number
  email: string
  report_type: string
  city_code: string | null
  city_name_zh: string | null
  created_at: string
}
