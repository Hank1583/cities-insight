'use client'
import { useState } from 'react'
import LineTrendChart from '@/components/charts/LineTrendChart'
import { TimeSeriesPoint } from '@/types/indicator'

interface Props {
  aqiSeries: TimeSeriesPoint[]
  tempSeries: TimeSeriesPoint[]
  rainfallSeries: TimeSeriesPoint[]
  reservoirSeries: TimeSeriesPoint[]
  electricitySeries: TimeSeriesPoint[]
  marginSeries: TimeSeriesPoint[]
}

const TABS = [
  { key: 'environment', label: '環境' },
  { key: 'water', label: '水資源' },
  { key: 'energy', label: '能源' },
]

export default function CityIndicatorTabs({ aqiSeries, tempSeries, rainfallSeries, reservoirSeries, electricitySeries, marginSeries }: Props) {
  const [activeTab, setActiveTab] = useState('environment')

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 px-5 pt-4 gap-1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'border-sky-500 text-sky-600 bg-sky-50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-6">
        {activeTab === 'environment' && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">空氣品質指數 (AQI) — 近 30 天</h4>
              <LineTrendChart data={aqiSeries} label="AQI" color="#f59e0b" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">氣溫 (°C) — 近 30 天</h4>
              <LineTrendChart data={tempSeries} label="氣溫" color="#ef4444" unit="°C" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">降雨量 (mm) — 近 30 天</h4>
              <LineTrendChart data={rainfallSeries} label="降雨量" color="#8b5cf6" unit="mm" />
            </div>
          </>
        )}
        {activeTab === 'water' && (
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-3">水庫蓄水率 (%) — 近 30 天</h4>
            <LineTrendChart data={reservoirSeries} label="蓄水率" color="#0ea5e9" unit="%" />
          </div>
        )}
        {activeTab === 'energy' && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">即時用電 (MW) — 近 30 天</h4>
              <LineTrendChart data={electricitySeries} label="用電" color="#eab308" unit="MW" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">備轉容量率 (%) — 近 30 天</h4>
              <LineTrendChart data={marginSeries} label="備轉容量" color="#10b981" unit="%" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
