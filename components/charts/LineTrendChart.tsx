'use client'
import { useState } from 'react'
import type { TimeSeriesPoint } from '@/types/indicator'

const W = 600, H = 220
const P = { t: 10, r: 15, b: 30, l: 44 }

function fmt(v: number) {
  if (Math.abs(v) >= 10000) return `${(v / 1000).toFixed(0)}k`
  if (Math.abs(v) >= 1000)  return `${(v / 1000).toFixed(1)}k`
  return v.toFixed(v % 1 === 0 ? 0 : 1)
}

interface Props {
  data: TimeSeriesPoint[]
  label?: string
  color?: string
  unit?: string
}

export default function LineTrendChart({ data, color = '#0ea5e9', unit = '' }: Props) {
  const [hov, setHov] = useState<number | null>(null)
  if (!data.length) return null

  const vals = data.map(d => d.value)
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || 1
  const cw = W - P.l - P.r
  const ch = H - P.t - P.b

  const cx = (i: number) => P.l + (i / Math.max(data.length - 1, 1)) * cw
  const cy = (v: number) => P.t + ch - ((v - lo) / span) * ch

  const linePts = data.map((d, i) => `${cx(i).toFixed(1)},${cy(d.value).toFixed(1)}`).join(' ')
  const areaPath =
    `M${cx(0).toFixed(1)},${cy(data[0].value).toFixed(1)} ` +
    data.slice(1).map((d, i) => `L${cx(i + 1).toFixed(1)},${cy(d.value).toFixed(1)}`).join(' ') +
    ` L${cx(data.length - 1).toFixed(1)},${(P.t + ch).toFixed(1)} L${P.l},${(P.t + ch).toFixed(1)} Z`

  const yTicks = Array.from({ length: 5 }, (_, i) => lo + (span / 4) * i)
  const xStep  = Math.max(1, Math.round(data.length / 6))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} role="img">
      {/* grid */}
      {yTicks.map((v, i) => (
        <line key={i} x1={P.l} y1={cy(v)} x2={W - P.r} y2={cy(v)} stroke="#f1f5f9" strokeWidth={1} />
      ))}
      {/* Y labels */}
      {yTicks.map((v, i) => (
        <text key={i} x={P.l - 5} y={cy(v) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{fmt(v)}</text>
      ))}
      {/* X labels */}
      {data.filter((_, i) => i % xStep === 0).map((d, i) => {
        const idx = data.indexOf(d)
        return (
          <text key={i} x={cx(idx)} y={H - 6} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {d.time.slice(5)}
          </text>
        )
      })}
      {/* area */}
      <path d={areaPath} fill={color} fillOpacity={0.08} />
      {/* line */}
      <polyline points={linePts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* hover zones */}
      {data.map((_, i) => (
        <rect
          key={i}
          x={cx(i) - cw / data.length / 2} y={P.t}
          width={cw / data.length} height={ch}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(null)}
        />
      ))}
      {/* tooltip */}
      {hov !== null && (() => {
        const d  = data[hov]
        const x  = cx(hov)
        const y  = cy(d.value)
        const tx = Math.min(x + 8, W - 120)
        const ty = Math.max(y - 16, P.t + 2)
        return (
          <>
            <circle cx={x} cy={y} r={4} fill={color} />
            <rect x={tx} y={ty} width={112} height={22} rx={5} fill="#1e293b" />
            <text x={tx + 56} y={ty + 15} textAnchor="middle" fontSize={11} fill="#f8fafc">
              {d.time.slice(5)} · {d.value}{unit}
            </text>
          </>
        )
      })()}
    </svg>
  )
}
