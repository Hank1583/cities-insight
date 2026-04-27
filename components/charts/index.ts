import dynamic from 'next/dynamic'

export const LineTrendChart = dynamic(() => import('./LineTrendChart'), { ssr: false })
export const BarRankingChart = dynamic(() => import('./BarRankingChart'), { ssr: false })
export const CompareLineChart = dynamic(() => import('./CompareLineChart'), { ssr: false })
