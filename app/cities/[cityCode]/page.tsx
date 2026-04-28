import CityClient from './CityClient'

const FALLBACK_CITIES = [
  'taipei', 'new-taipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung',
  'hsinchu-city', 'hsinchu-county', 'miaoli', 'changhua', 'nantou',
  'yunlin', 'chiayi-city', 'chiayi-county', 'pingtung', 'yilan',
  'hualien', 'taitung', 'penghu', 'kinmen', 'lienchiang', 'keelung',
]

export async function generateStaticParams() {
  try {
    const res = await fetch('https://www.highlight.url.tw/cities-insight/api/cities')
    const cities = await res.json()
    return (cities as { code: string }[]).map(c => ({ cityCode: c.code }))
  } catch {
    return FALLBACK_CITIES.map(code => ({ cityCode: code }))
  }
}

export default async function CityPage({ params }: { params: Promise<{ cityCode: string }> }) {
  const { cityCode } = await params
  return <CityClient cityCode={cityCode} />
}
