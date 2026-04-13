export interface Report {
  id: string
  title: string
  period: string
  createdAt: string
  status: 'sent' | 'pending' | 'draft'
  recipients: number
}
