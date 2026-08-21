import { useEffect, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { ALLOCATION_SEGMENTS, ALLOCATION_TOTAL_VALUE } from '../data/allocation'
import './AllocationCard.css'

interface AllocationCardProps {
  timeRange: string
}

const BASE_OUTER_RADIUS = 88
const BASE_INNER_RADIUS = 60
const HOVER_EXPAND = 4

function formatValue(value: number): string {
  return `$${(value / 1_000_000).toFixed(1)}M`
}

function AllocationCard({ timeRange }: AllocationCardProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [lockIndex, setLockIndex] = useState<number | null>(null)

  useEffect(() => {
    setHoverIndex(null)
    setLockIndex(null)
  }, [timeRange])

  const activeIndex = lockIndex ?? hoverIndex
  const activeSegment = activeIndex !== null ? ALLOCATION_SEGMENTS[activeIndex] : null

  const handleMouseEnter = (index: number) => {
    setHoverIndex(index)
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  const handleClick = (index: number) => {
    setLockIndex((current) => (current === index ? null : index))
  }

  return (
    <div className="allocation-card">
      <div className="allocation-card-header">
        <h2 className="allocation-card-title">Allocation</h2>
      </div>

      <div className="allocation-chart-area">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={ALLOCATION_SEGMENTS}
              dataKey="percent"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={BASE_INNER_RADIUS}
              outerRadius={BASE_OUTER_RADIUS}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
              onMouseEnter={(_, index) => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={(_, index) => handleClick(index)}
              shape={(props: PieSectorDataItem & { index: number }) => (
                <Sector
                  {...props}
                  outerRadius={
                    props.index === activeIndex ? BASE_OUTER_RADIUS + HOVER_EXPAND : BASE_OUTER_RADIUS
                  }
                  style={{ transition: 'all 220ms ease-out', cursor: 'pointer', outline: 'none' }}
                />
              )}
            >
              {ALLOCATION_SEGMENTS.map((segment) => (
                <Cell key={segment.label} fill={segment.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="allocation-center-label">
          {activeSegment ? (
            <>
              <div className="allocation-center-amount">{formatValue(activeSegment.value)}</div>
              <div className="allocation-center-caption">{activeSegment.label.toUpperCase()}</div>
            </>
          ) : (
            <>
              <div className="allocation-center-amount">{formatValue(ALLOCATION_TOTAL_VALUE)}</div>
              <div className="allocation-center-caption">TOTAL</div>
            </>
          )}
        </div>
      </div>

      <ul className="allocation-legend">
        {ALLOCATION_SEGMENTS.map((segment, index) => (
          <li
            key={segment.label}
            className={`allocation-legend-item${index === activeIndex ? ' active' : ''}`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          >
            <span className="allocation-legend-swatch" style={{ background: segment.color }} />
            <span className="allocation-legend-label">{segment.label}</span>
            <span className="allocation-legend-percent">{segment.percent}%</span>
            <span className="allocation-legend-value">{formatValue(segment.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AllocationCard
