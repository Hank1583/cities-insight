import { Metadata } from 'next'
import CityClient from './CityClient'
import { CITIES } from '@/lib/mock/cities'

const FALLBACK_CITIES = [
  'taipei', 'new-taipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung',
  'hsinchu-city', 'hsinchu-county', 'miaoli', 'changhua', 'nantou',
  'yunlin', 'chiayi-city', 'chiayi-county', 'pingtung', 'yilan',
  'hualien', 'taitung', 'penghu', 'kinmen', 'lienchiang', 'keelung',
]

export async function generateStaticParams() {
  try {
    const res = await fetch('https://cities.highlightsignal.com/api/cities')
    const cities = await res.json()
    return (cities as { code: string }[]).map(c => ({ cityCode: c.code }))
  } catch {
    return FALLBACK_CITIES.map(code => ({ cityCode: code }))
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ cityCode: string }> }
): Promise<Metadata> {
  const { cityCode } = await params
  const city = CITIES.find(c => c.code === cityCode)
  const name = city ? `${city.nameZh}（${city.nameEn}）` : cityCode

  return {
    title: `${city?.nameZh ?? cityCode} 城市數據 | Cities Insight`,
    description: `探索${name}的環境、能源、水資源與經濟指標趨勢，掌握即時數據變化。`,
    openGraph: {
      title: `${city?.nameZh ?? cityCode} 城市數據 | Cities Insight`,
      description: `探索${name}的環境、能源、水資源與經濟指標趨勢，掌握即時數據變化。`,
      url: `https://cities.highlightsignal.com/cities/${cityCode}`,
    },
  }
}

export default async function CityPage({ params }: { params: Promise<{ cityCode: string }> }) {
  const { cityCode } = await params
  return <CityClient cityCode={cityCode} />
}
