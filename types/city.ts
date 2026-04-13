export interface City {
  code: string
  nameZh: string
  nameEn: string
  population: number
  area: number
  lat: number
  lng: number
}

export interface CitySummary {
  city: string
  updatedAt: string
  metrics: {
    aqi: number
    pm25: number
    temperature: number
    rainfall: number
    reservoir_storage: number
    electricity_load: number
    reserve_margin: number
  }
}
