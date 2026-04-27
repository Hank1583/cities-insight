'use client'
import LineTrendChart  from './LineTrendChart'
import BarRankingChart from './BarRankingChart'
import type { ApiTimeSeries } from '@/lib/api/client'

interface Props {
  series:          ApiTimeSeries[]
  rankingData:     { label: string; value: number }[]
  indicatorNameZh: string
  unit:            string
  isNational:      boolean
  isMonthly:       boolean
}

export default function IndicatorCharts({ series, rankingData, indicatorNameZh, unit, isNational, isMonthly }: Props) {
  return (
    <>
      {series.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">
            {isNational ? '全國趨勢' : '台北市趨勢'} —
            {isMonthly ? ' 近 12 個月' : ' 近 30 天'}
          </h3>
          <LineTrendChart data={series} label={indicatorNameZh} unit={unit} color="#0ea5e9" />
        </div>
      )}

      {rankingData.length > 0 && !isNational && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">各城市最新值排行</h3>
          <BarRankingChart data={rankingData} unit={unit} horizontal color="#0ea5e9" />
        </div>
      )}
    </>
  )
}
