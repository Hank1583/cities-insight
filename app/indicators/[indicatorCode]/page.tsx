import IndicatorClient from './IndicatorClient'

const FALLBACK_INDICATORS = [
  'aqi', 'pm25', 'weather_temp', 'rainfall',
  'reservoir_storage', 'electricity_monthly',
  'electricity_load', 'reserve_margin',
]

export async function generateStaticParams() {
  try {
    const res = await fetch('https://www.highlight.url.tw/cities-insight/api/indicators')
    const indicators = await res.json()
    return (indicators as { code: string }[]).map(i => ({ indicatorCode: i.code }))
  } catch {
    return FALLBACK_INDICATORS.map(code => ({ indicatorCode: code }))
  }
}

export default async function IndicatorPage({ params }: { params: Promise<{ indicatorCode: string }> }) {
  const { indicatorCode } = await params
  return <IndicatorClient indicatorCode={indicatorCode} />
}
