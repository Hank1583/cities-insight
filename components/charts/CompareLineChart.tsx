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

  // Collect all unique time keys across all cities
  const timeSet = new Set<string>()
  for (const code of cityCodes) {
    for (const pt of data[code]) timeSet.add(pt.time)
  }
  const allTimes = Array.from(timeSet).sort()
  if (allTimes.length === 0) return null

  // Build lookup: city -> time -> value
  const lookup: Record<string, Record<string, number>> = {}
  for (const code of cityCodes) {
    lookup[code] = {}
    for (const pt of data[code]) lookup[code][pt.time] = pt.value
  }

  const merged = allTimes.map(t => {
    const row: Record<string, string | number> = { time: t.slice(5) }
    for (const code of cityCodes) row[code] = lookup[code][t] ?? 0
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
          <Line key={code} type="monotone" dataKey={code} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={allTimes.length <= 3} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
