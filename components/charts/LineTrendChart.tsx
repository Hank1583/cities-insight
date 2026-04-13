'use client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { TimeSeriesPoint } from '@/types/indicator'

interface LineTrendChartProps {
  data: TimeSeriesPoint[]
  label?: string
  color?: string
  unit?: string
}

export default function LineTrendChart({ data, label = '數值', color = '#0ea5e9', unit = '' }: LineTrendChartProps) {
  const formatted = data.map(d => ({ ...d, time: d.time.slice(5) }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }}
          formatter={(v) => [`${v}${unit}`, label]}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} name={label} />
      </LineChart>
    </ResponsiveContainer>
  )
}
