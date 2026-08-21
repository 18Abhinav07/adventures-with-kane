import { useRef, useState } from 'react'
import ExportPopover from './ExportPopover'
import CustomizeDrawer from './CustomizeDrawer'
import type { DisplayDensity, ChartOption } from '../data/customize'
import './WorkspaceHeader.css'

export const TIME_RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'] as const
export const DEFAULT_TIME_RANGE = '1M'

interface WorkspaceHeaderProps {
  heading: string
  subtitle: string
  timeRange: string
  onTimeRangeChange: (range: string) => void
  density: DisplayDensity
  onDensityChange: (density: DisplayDensity) => void
  visibleSections: Record<string, boolean>
  onToggleSection: (id: string) => void
  chartOptions: Record<ChartOption['id'], boolean>
  onToggleChartOption: (id: ChartOption['id']) => void
}

function WorkspaceHeader({
  heading,
  subtitle,
  timeRange,
  onTimeRangeChange,
  density,
  onDensityChange,
  visibleSections,
  onToggleSection,
  chartOptions,
  onToggleChartOption,
}: WorkspaceHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; bottom: number } | null>(null)
  const exportButtonRef = useRef<HTMLButtonElement>(null)

  const handleToggleExport = () => {
    if (!exportOpen && exportButtonRef.current) {
      const rect = exportButtonRef.current.getBoundingClientRect()
      setAnchorRect({ top: rect.top, left: rect.left, bottom: rect.bottom })
    }
    setExportOpen((current) => !current)
  }

  return (
    <div className="workspace-header">
      <div className="workspace-header-titles">
        <h1 className="workspace-title">{heading}</h1>
        <p className="workspace-subtitle">{subtitle}</p>
      </div>

      <div className="workspace-header-controls">
        <div className="time-range-group" role="group" aria-label="Time range">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              className={`time-range-item${range === timeRange ? ' active' : ''}`}
              aria-pressed={range === timeRange}
              onClick={() => onTimeRangeChange(range)}
            >
              {range}
            </button>
          ))}
        </div>

        <button
          ref={exportButtonRef}
          type="button"
          className="workspace-action-button"
          onClick={handleToggleExport}
        >
          Export
        </button>
        <button
          type="button"
          className="workspace-action-button"
          onClick={() => setCustomizeOpen((current) => !current)}
        >
          Customize
        </button>
      </div>

      {exportOpen && anchorRect && (
        <ExportPopover anchorRect={anchorRect} onClose={() => setExportOpen(false)} />
      )}

      {customizeOpen && (
        <CustomizeDrawer
          density={density}
          onDensityChange={onDensityChange}
          visibleSections={visibleSections}
          onToggleSection={onToggleSection}
          chartOptions={chartOptions}
          onToggleChartOption={onToggleChartOption}
          onClose={() => setCustomizeOpen(false)}
        />
      )}
    </div>
  )
}

export default WorkspaceHeader
