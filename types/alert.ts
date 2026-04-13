export interface Alert {
  id: string
  cityCode: string
  cityNameZh: string
  indicatorCode: string
  indicatorNameZh: string
  condition: string
  value: number
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved'
  triggeredAt: string
  resolvedAt?: string
}
