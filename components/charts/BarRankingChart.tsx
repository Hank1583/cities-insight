'use client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'

interface BarRankingChartProps {
  data: { label: string; value: number }[]
  color?: string
  unit?: string
  horizontal?: boolean
}

export default function BarRankingChart({ data, color = '#0ea5e9', unit = '', horizontal = false }: BarRankingChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 40)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 70, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: '#334155' }} tickLine={false} axisLine={false} width={60} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }}
            formatter={(v) => [`${v}${unit}`, '數值']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={i === 0 ? color : `${color}88`} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              style={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              formatter={(v: unknown) => `${typeof v === 'number' ? v.toFixed(v > 100 ? 0 : 1) : v}${unit}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }}
          formatter={(v) => [`${v}${unit}`, '數值']}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={i === 0 ? color : `${color}99`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
