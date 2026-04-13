'use client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { TimeSeriesPoint } from '@/types/indicator'

interface CompareLineChartProps {
  data: Record<string, TimeSeriesPoint[]>
  cityNames: Record<string, string>
  unit?: string
}

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f97316']

export default function CompareLineChart({ data, cityNames, unit = '' }: CompareLineChartProps) {
  const cityCodes = Object.keys(data)
  if (cityCodes.length === 0) return null

  // Merge all series by time
  const times = data[cityCodes[0]].map(d => d.time.slice(5))
  const merged = times.map((time, i) => {
    const row: Record<string, string | number> = { time }
    for (const code of cityCodes) {
      row[code] = data[code][i]?.value ?? 0
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }}
          formatter={(v, name) => [`${v}${unit}`, cityNames[String(name)] ?? String(name)]}
        />
        <Legend formatter={(v) => cityNames[v] ?? v} wrapperStyle={{ fontSize: 12 }} />
        {cityCodes.map((code, i) => (
          <Line key={code} type="monotone" dataKey={code} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
