'use client'

interface Props {
  data: { label: string; value: number }[]
  color?: string
  unit?: string
  horizontal?: boolean
}

function valFmt(v: number) {
  return v.toFixed(v > 100 ? 0 : 1)
}

export default function BarRankingChart({ data, color = '#0ea5e9', unit = '', horizontal = false }: Props) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const maxV   = Math.max(...sorted.map(d => d.value)) || 1

  if (horizontal) {
    const ROW = 38
    const W   = 600
    const H   = sorted.length * ROW + 16
    const LBL = 80   // label column width
    const VAL = 72   // value column width
    const BAR_X = LBL + 6
    const BAR_W = W - LBL - VAL - 12

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: Math.max(H, 80) }} role="img">
        {sorted.map((d, i) => {
          const y  = i * ROW + 8
          const bw = (d.value / maxV) * BAR_W
          return (
            <g key={i}>
              <text x={LBL - 6} y={y + 23} textAnchor="end" fontSize={12} fill="#334155">{d.label}</text>
              <rect x={BAR_X} y={y + 8} width={Math.max(bw, 2)} height={18} rx={3}
                fill={i === 0 ? color : `${color}88`} />
              <text x={BAR_X + bw + 6} y={y + 23} fontSize={11} fontWeight={600} fill="#334155">
                {valFmt(d.value)}{unit}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  // Vertical bar chart
  const W  = 600, H = 220
  const P  = { t: 8, r: 10, b: 28, l: 8 }
  const cw = W - P.l - P.r
  const ch = H - P.t - P.b
  const gap = cw / sorted.length
  const bw  = gap * 0.65

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} role="img">
      {sorted.map((d, i) => {
        const x  = P.l + i * gap + (gap - bw) / 2
        const bh = (d.value / maxV) * ch
        const y  = P.t + ch - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={3}
              fill={i === 0 ? color : `${color}99`} />
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
