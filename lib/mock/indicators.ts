import { Indicator } from '@/types/indicator'

export const INDICATORS: Indicator[] = [
  { code: 'aqi', nameZh: '空氣品質指數', nameEn: 'AQI', category: 'environment', unit: 'index', freq: 'hourly', sourceName: '環境部', description: '空氣品質指標，0-50良好，51-100普通，101+不健康' },
  { code: 'pm25', nameZh: 'PM2.5', nameEn: 'PM2.5', category: 'environment', unit: 'μg/m³', freq: 'hourly', sourceName: '環境部', description: '細懸浮微粒濃度，標準值24小時平均35μg/m³' },
  { code: 'weather_temp', nameZh: '即時氣溫', nameEn: 'Temperature', category: 'environment', unit: '°C', freq: 'hourly', sourceName: '中央氣象署' },
  { code: 'weather_forecast_temp', nameZh: '天氣預報氣溫', nameEn: 'Forecast Temp', category: 'environment', unit: '°C', freq: 'daily', sourceName: '中央氣象署' },
  { code: 'earthquake_count', nameZh: '地震次數', nameEn: 'Earthquake Count', category: 'environment', unit: '次', freq: 'daily', sourceName: '中央氣象署' },
  { code: 'tide_level', nameZh: '潮汐水位', nameEn: 'Tide Level', category: 'environment', unit: 'm', freq: 'hourly', sourceName: '交通部' },
  { code: 'wave_height', nameZh: '海浪高度', nameEn: 'Wave Height', category: 'environment', unit: 'm', freq: 'hourly', sourceName: '交通部' },
  { code: 'rainfall', nameZh: '降雨量', nameEn: 'Rainfall', category: 'environment', unit: 'mm', freq: 'hourly', sourceName: '中央氣象署' },
  { code: 'reservoir_storage', nameZh: '水庫蓄水量', nameEn: 'Reservoir Storage', category: 'water', unit: '%', freq: 'daily', sourceName: '經濟部水利署', description: '水庫有效蓄水量百分比' },
  { code: 'river_water_level', nameZh: '河川水位', nameEn: 'River Level', category: 'water', unit: 'm', freq: 'hourly', sourceName: '經濟部水利署' },
  { code: 'electricity_load', nameZh: '即時用電', nameEn: 'Electricity Load', category: 'energy', unit: 'MW', freq: 'hourly', sourceName: '台電' },
  { code: 'reserve_margin', nameZh: '備轉容量率', nameEn: 'Reserve Margin', category: 'energy', unit: '%', freq: 'hourly', sourceName: '台電', description: '電力備轉容量率，低於6%為供電警戒' },
  { code: 'power_generation_mix', nameZh: '發電結構', nameEn: 'Power Mix', category: 'energy', unit: '%', freq: 'daily', sourceName: '台電' },
  { code: 'renewable_energy_ratio', nameZh: '再生能源比例', nameEn: 'Renewable Ratio', category: 'energy', unit: '%', freq: 'daily', sourceName: '台電' },
  { code: 'economic_index', nameZh: '經濟指標', nameEn: 'Economic Index', category: 'economy', unit: 'index', freq: 'monthly', sourceName: '主計總處' },
]

export function getIndicatorByCode(code: string): Indicator | undefined {
  return INDICATORS.find(i => i.code === code)
}
