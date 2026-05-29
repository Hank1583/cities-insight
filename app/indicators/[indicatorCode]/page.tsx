import { Metadata } from 'next'
import IndicatorClient from './IndicatorClient'
import { INDICATORS } from '@/lib/mock/indicators'

const FALLBACK_INDICATORS = [
  'aqi', 'pm25', 'weather_temp', 'rainfall',
  'reservoir_storage', 'electricity_monthly',
  'electricity_load', 'reserve_margin',
]

export async function generateStaticParams() {
  try {
    const res = await fetch('https://cities.highlightsignal.com/api/indicators')
    const indicators = await res.json()
    return (indicators as { code: string }[]).map(i => ({ indicatorCode: i.code }))
  } catch {
    return FALLBACK_INDICATORS.map(code => ({ indicatorCode: code }))
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ indicatorCode: string }> }
): Promise<Metadata> {
  const { indicatorCode } = await params
  const indicator = INDICATORS.find(i => i.code === indicatorCode)

  return {
    title: `${indicator?.nameZh ?? indicatorCode} 指標分析 | Cities Insight`,
    description: `查看台灣各縣市${indicator?.nameZh ?? indicatorCode}的趨勢比較與數據分析。${indicator?.description ?? ''}`,
    openGraph: {
      title: `${indicator?.nameZh ?? indicatorCode} 指標分析 | Cities Insight`,
      description: `查看台灣各縣市${indicator?.nameZh ?? indicatorCode}的趨勢比較與數據分析。`,
      url: `https://cities.highlightsignal.com/indicators/${indicatorCode}`,
    },
  }
}

export default async function IndicatorPage({ params }: { params: Promise<{ indicatorCode: string }> }) {
  const { indicatorCode } = await params
  return <IndicatorClient indicatorCode={indicatorCode} />
}
