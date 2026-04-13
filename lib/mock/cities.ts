import { City } from '@/types/city'

export const CITIES: City[] = [
  { code: 'taipei', nameZh: '台北市', nameEn: 'Taipei City', population: 2481234, area: 271.8, lat: 25.0375, lng: 121.5637 },
  { code: 'new-taipei', nameZh: '新北市', nameEn: 'New Taipei City', population: 4030000, area: 2052.6, lat: 25.0118, lng: 121.4657 },
  { code: 'taoyuan', nameZh: '桃園市', nameEn: 'Taoyuan City', population: 2280000, area: 1220.9, lat: 24.9936, lng: 121.3010 },
  { code: 'taichung', nameZh: '台中市', nameEn: 'Taichung City', population: 2850000, area: 2214.9, lat: 24.1477, lng: 120.6736 },
  { code: 'tainan', nameZh: '台南市', nameEn: 'Tainan City', population: 1878000, area: 2191.7, lat: 22.9998, lng: 120.2269 },
  { code: 'kaohsiung', nameZh: '高雄市', nameEn: 'Kaohsiung City', population: 2765000, area: 2951.9, lat: 22.6273, lng: 120.3014 },
  { code: 'keelung', nameZh: '基隆市', nameEn: 'Keelung City', population: 365000, area: 132.8, lat: 25.1283, lng: 121.7419 },
  { code: 'hsinchu-city', nameZh: '新竹市', nameEn: 'Hsinchu City', population: 455000, area: 104.2, lat: 24.8066, lng: 120.9686 },
  { code: 'hsinchu-county', nameZh: '新竹縣', nameEn: 'Hsinchu County', population: 590000, area: 1427.5, lat: 24.8387, lng: 121.0177 },
  { code: 'miaoli', nameZh: '苗栗縣', nameEn: 'Miaoli County', population: 535000, area: 1820.3, lat: 24.5600, lng: 120.8214 },
  { code: 'changhua', nameZh: '彰化縣', nameEn: 'Changhua County', population: 1270000, area: 1074.4, lat: 24.0518, lng: 120.5161 },
  { code: 'nantou', nameZh: '南投縣', nameEn: 'Nantou County', population: 490000, area: 4106.4, lat: 23.9609, lng: 120.9718 },
  { code: 'yunlin', nameZh: '雲林縣', nameEn: 'Yunlin County', population: 680000, area: 1291.0, lat: 23.7092, lng: 120.4313 },
  { code: 'chiayi-city', nameZh: '嘉義市', nameEn: 'Chiayi City', population: 265000, area: 60.0, lat: 23.4801, lng: 120.4491 },
  { code: 'chiayi-county', nameZh: '嘉義縣', nameEn: 'Chiayi County', population: 500000, area: 1903.6, lat: 23.4518, lng: 120.2554 },
  { code: 'pingtung', nameZh: '屏東縣', nameEn: 'Pingtung County', population: 820000, area: 2775.6, lat: 22.5519, lng: 120.5487 },
  { code: 'yilan', nameZh: '宜蘭縣', nameEn: 'Yilan County', population: 455000, area: 2143.6, lat: 24.7021, lng: 121.7378 },
  { code: 'hualien', nameZh: '花蓮縣', nameEn: 'Hualien County', population: 325000, area: 4628.6, lat: 23.9871, lng: 121.6015 },
  { code: 'taitung', nameZh: '台東縣', nameEn: 'Taitung County', population: 220000, area: 3515.3, lat: 22.7972, lng: 121.0713 },
  { code: 'penghu', nameZh: '澎湖縣', nameEn: 'Penghu County', population: 104000, area: 126.9, lat: 23.5711, lng: 119.5793 },
  { code: 'kinmen', nameZh: '金門縣', nameEn: 'Kinmen County', population: 143000, area: 151.7, lat: 24.4493, lng: 118.3765 },
  { code: 'lienchiang', nameZh: '連江縣', nameEn: 'Lienchiang County', population: 13000, area: 28.8, lat: 26.1505, lng: 119.9497 },
]

export function getCityByCode(code: string): City | undefined {
  return CITIES.find(c => c.code === code)
}
