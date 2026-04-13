import { TimeSeriesPoint } from '@/types/indicator'

function generateSeries(days: number, base: number, variance: number, trend = 0): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  let value = base
  for (let i = days; i >= 0; i--) {
    const date = new Date('2026-04-09')
    date.setDate(date.getDate() - i)
    value = Math.max(0, value + trend + (Math.random() - 0.5) * variance * 2)
    points.push({
      time: date.toISOString().split('T')[0],
      value: Math.round(value * 10) / 10,
    })
  }
  return points
}

const SERIES_CONFIG: Record<string, { base: number; variance: number; trend?: number }> = {
  aqi:                { base: 55, variance: 15 },
  pm25:               { base: 15, variance: 5 },
  weather_temp:       { base: 25, variance: 3 },
  rainfall:           { base: 3, variance: 4 },
  reservoir_storage:  { base: 72, variance: 3, trend: -0.05 },
  electricity_load:   { base: 3100, variance: 300 },
  reserve_margin:     { base: 11, variance: 2 },
  river_water_level:  { base: 2.5, variance: 0.8 },
  earthquake_count:   { base: 2, variance: 2 },
}

export function getTimeSeries(indicatorCode: string, days = 30): TimeSeriesPoint[] {
  const config = SERIES_CONFIG[indicatorCode] ?? { base: 50, variance: 10 }
  return generateSeries(days, config.base, config.variance, config.trend)
}

export function getCompareSeriesForCities(
  indicatorCode: string,
  cityCodes: string[],
  days = 30
): Record<string, TimeSeriesPoint[]> {
  const result: Record<string, TimeSeriesPoint[]> = {}
  const config = SERIES_CONFIG[indicatorCode] ?? { base: 50, variance: 10 }
  const cityOffsets: Record<string, number> = {
    taipei: 0, 'new-taipei': -5, taoyuan: 7, taichung: 20, tainan: 25,
    kaohsiung: 30, keelung: -13, yilan: -17, hualien: -20,
  }
  for (const code of cityCodes) {
    const offset = cityOffsets[code] ?? 0
    result[code] = generateSeries(days, config.base + offset, config.variance, config.trend)
  }
  return result
}
