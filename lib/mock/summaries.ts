import { CitySummary } from '@/types/city'

const BASE: CitySummary['metrics'] = {
  aqi: 52, pm25: 14.2, temperature: 25.6, rainfall: 3.2,
  reservoir_storage: 78.5, electricity_load: 3120, reserve_margin: 11.4,
}

function vary(base: number, pct: number): number {
  const delta = base * pct * (Math.random() * 2 - 1)
  return Math.round((base + delta) * 10) / 10
}

const CITY_OFFSETS: Record<string, Partial<CitySummary['metrics']>> = {
  'taipei':         { aqi: 55, pm25: 15, temperature: 26, rainfall: 2.1, reservoir_storage: 82, electricity_load: 3120, reserve_margin: 11.4 },
  'new-taipei':     { aqi: 50, pm25: 13, temperature: 25, rainfall: 2.8, reservoir_storage: 75, electricity_load: 2850, reserve_margin: 12.1 },
  'taoyuan':        { aqi: 62, pm25: 18, temperature: 25, rainfall: 1.5, reservoir_storage: 68, electricity_load: 3200, reserve_margin: 10.8 },
  'taichung':       { aqi: 75, pm25: 22, temperature: 27, rainfall: 4.2, reservoir_storage: 72, electricity_load: 4100, reserve_margin: 9.5 },
  'tainan':         { aqi: 80, pm25: 25, temperature: 29, rainfall: 1.0, reservoir_storage: 58, electricity_load: 2600, reserve_margin: 10.2 },
  'kaohsiung':      { aqi: 85, pm25: 28, temperature: 30, rainfall: 0.8, reservoir_storage: 55, electricity_load: 3800, reserve_margin: 9.8 },
  'keelung':        { aqi: 42, pm25: 11, temperature: 24, rainfall: 8.5, reservoir_storage: 90, electricity_load: 420, reserve_margin: 13.5 },
  'hsinchu-city':   { aqi: 58, pm25: 16, temperature: 25, rainfall: 1.8, reservoir_storage: 70, electricity_load: 650, reserve_margin: 11.8 },
  'hsinchu-county': { aqi: 56, pm25: 15, temperature: 25, rainfall: 2.0, reservoir_storage: 72, electricity_load: 580, reserve_margin: 11.5 },
  'miaoli':         { aqi: 60, pm25: 17, temperature: 26, rainfall: 3.0, reservoir_storage: 74, electricity_load: 350, reserve_margin: 12.0 },
  'changhua':       { aqi: 70, pm25: 20, temperature: 27, rainfall: 2.5, reservoir_storage: 65, electricity_load: 750, reserve_margin: 10.5 },
  'nantou':         { aqi: 45, pm25: 12, temperature: 24, rainfall: 5.0, reservoir_storage: 85, electricity_load: 280, reserve_margin: 13.0 },
  'yunlin':         { aqi: 72, pm25: 21, temperature: 28, rainfall: 2.0, reservoir_storage: 62, electricity_load: 420, reserve_margin: 10.8 },
  'chiayi-city':    { aqi: 78, pm25: 24, temperature: 29, rainfall: 1.5, reservoir_storage: 60, electricity_load: 380, reserve_margin: 10.3 },
  'chiayi-county':  { aqi: 76, pm25: 23, temperature: 28, rainfall: 1.8, reservoir_storage: 62, electricity_load: 340, reserve_margin: 10.5 },
  'pingtung':       { aqi: 82, pm25: 26, temperature: 30, rainfall: 1.2, reservoir_storage: 52, electricity_load: 520, reserve_margin: 9.7 },
  'yilan':          { aqi: 38, pm25: 10, temperature: 23, rainfall: 10.5, reservoir_storage: 92, electricity_load: 310, reserve_margin: 14.0 },
  'hualien':        { aqi: 35, pm25: 9, temperature: 24, rainfall: 6.0, reservoir_storage: 88, electricity_load: 260, reserve_margin: 14.5 },
  'taitung':        { aqi: 32, pm25: 8, temperature: 25, rainfall: 5.5, reservoir_storage: 80, electricity_load: 220, reserve_margin: 15.0 },
  'penghu':         { aqi: 48, pm25: 13, temperature: 26, rainfall: 0.5, reservoir_storage: 40, electricity_load: 150, reserve_margin: 12.0 },
  'kinmen':         { aqi: 50, pm25: 14, temperature: 24, rainfall: 0.8, reservoir_storage: 45, electricity_load: 120, reserve_margin: 11.5 },
  'lienchiang':     { aqi: 44, pm25: 12, temperature: 22, rainfall: 1.0, reservoir_storage: 50, electricity_load: 30, reserve_margin: 12.5 },
}

export function getCitySummary(cityCode: string): CitySummary {
  const offsets = CITY_OFFSETS[cityCode] || BASE
  return {
    city: cityCode,
    updatedAt: '2026-04-09T12:00:00+08:00',
    metrics: {
      aqi: vary(offsets.aqi ?? BASE.aqi, 0.05),
      pm25: vary(offsets.pm25 ?? BASE.pm25, 0.05),
      temperature: vary(offsets.temperature ?? BASE.temperature, 0.03),
      rainfall: vary(offsets.rainfall ?? BASE.rainfall, 0.1),
      reservoir_storage: vary(offsets.reservoir_storage ?? BASE.reservoir_storage, 0.02),
      electricity_load: vary(offsets.electricity_load ?? BASE.electricity_load, 0.04),
      reserve_margin: vary(offsets.reserve_margin ?? BASE.reserve_margin, 0.05),
    }
  }
}

export const ALL_SUMMARIES = Object.keys(CITY_OFFSETS).map(getCitySummary)
