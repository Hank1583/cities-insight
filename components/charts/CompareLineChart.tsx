'use client'
import type { TimeSeriesPoint } from '@/types/indicator'

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f97316']

const W = 600, H = 300
const P = { t: 10, r: 15, b: 48, l: 44 }

function yFmt(v: number) {
  if (Math.abs(v) >= 10000) return `${(v / 1000).toFixed(0)}k`
  if (Math.abs(v) >= 1000)  return `${(v / 1000).toFixed(1)}k`
  return v.toFixed(v % 1 === 0 ? 0 : 1)
}

interface Props {
  data: Record<string, TimeSeriesPoint[]>
  cityNames: Record<string, string>
  unit?: string
}

export default function CompareLineChart({ data, cityNames, unit = '' }: Props) {
  const codes = Object.keys(data)
  if (!codes.length) return null

  const timeSet = new Set<string>()
  for (const c of codes) for (const pt of data[c]) timeSet.add(pt.time)
  const times = Array.from(timeSet).sort()
  if (!times.length) return null

  const allVals = codes.flatMap(c => data[c].map(p => p.value))
  const lo = Math.min(...allVals), hi = Math.max(...allVals)
  const span = hi - lo || 1

  const cw = W - P.l - P.r
  const ch = H - P.t - P.b

  const cx = (i: number) => P.l + (i / Math.max(times.length - 1, 1)) * cw
  const cy = (v: number) => P.t + ch - ((v - lo) / span) * ch

  const lookup: Record<string, Record<string, number>> = {}
  for (const c of codes) {
    lookup[c] = {}
    for (const pt of data[c]) lookup[c][pt.time] = pt.value
  }

  const yTicks = Array.from({ length: 5 }, (_, i) => lo + (span / 4) * i)
  const xStep  = Math.max(1, Math.round(times.length / 6))

  // legend layout
  const legendCols = Math.min(codes.length, 4)
  const colW = cw / legendCols

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} role="img">
      {/* grid */}
      {yTicks.map((v, i) => (
        <line key={i} x1={P.l} y1={cy(v)} x2={W - P.r} y2={cy(v)} stroke="#f1f5f9" strokeWidth={1} />
      ))}
      {/* Y labels */}
      {yTicks.map((v, i) => (
        <text key={i} x={P.l - 5} y={cy(v) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
          {yFmt(v)}
        </text>
      ))}
      {/* X labels */}
      {times.filter((_, i) => i % xStep === 0).map((t, i) => (
        <text key={i} x={cx(times.indexOf(t))} y={P.t + ch + 14} textAnchor="middle" fontSize={10} fill="#94a3b8">
          {t.slice(5)}
        </text>
      ))}
      {/* lines */}
      {codes.map((code, ci) => {
        const segments: string[] = []
        let seg = ''
        times.forEach((t, i) => {
          const v = lookup[code][t]
          if (v === undefined) { if (seg) { segments.push(seg); seg = '' } return }
          seg += (seg ? ' L' : 'M') + `${cx(i).toFixed(1)},${cy(v).toFixed(1)}`
        })
        if (seg) segments.push(seg)
        return segments.map((d, si) => (
          <path key={`${code}-${si}`} d={d} fill="none"
            stroke={COLORS[ci % COLORS.length]} strokeWidth={2}
            strokeLinejoin="round" strokeLinecap="round" />
        ))
      })}
      {/* legend */}
      {codes.map((code, ci) => {
        const col = ci % legendCols
        const row = Math.floor(ci / legendCols)
        const lx  = P.l + col * colW
        const ly  = P.t + ch + 24 + row * 16
        return (
          <g key={code}>
            <rect x={lx} y={ly} width={12} height={10} rx={2} fill={COLORS[ci % COLORS.length]} />
            <text x={lx + 16} y={ly + 9} fontSize={11} fill="#475569">{cityNames[code] ?? code}</text>
          </g>
        )
      })}
    </svg>
  )
}
