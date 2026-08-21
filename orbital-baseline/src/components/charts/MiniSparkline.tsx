interface MiniSparklineProps {
  points: number[]
  width?: number
  height?: number
  tone?: 'positive' | 'negative' | 'neutral'
  strokeWidth?: number
}

export function MiniSparkline({ points, width = 64, height = 24, tone = 'neutral', strokeWidth = 1.5 }: MiniSparklineProps) {
  if (points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = width / (points.length - 1)
  const path = points
    .map((p, i) => {
      const x = i * step
      const y = height - ((p - min) / range) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  const color =
    tone === 'positive' ? 'var(--color-positive)' : tone === 'negative' ? 'var(--color-negative)' : 'var(--color-information)'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
