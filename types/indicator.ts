export interface Indicator {
  code: string
  nameZh: string
  nameEn?: string
  category: 'environment' | 'water' | 'energy' | 'economy'
  unit: string
  freq: string
  sourceName: string
  sourceUrl?: string
  description?: string
}

export interface TimeSeriesPoint {
  time: string
  value: number
}

export interface IndicatorRanking {
  cityCode: string
  cityNameZh: string
  value: number
  rank: number
}
