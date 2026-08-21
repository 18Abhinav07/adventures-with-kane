import { useEffect, useRef } from 'react'
import {
  DENSITY_OPTIONS,
  SECTION_OPTIONS,
  CHART_OPTIONS,
  type DisplayDensity,
  type ChartOption,
} from '../data/customize'
import './CustomizeDrawer.css'

interface CustomizeDrawerProps {
  density: DisplayDensity
  onDensityChange: (density: DisplayDensity) => void
  visibleSections: Record<string, boolean>
  onToggleSection: (id: string) => void
  chartOptions: Record<ChartOption['id'], boolean>
  onToggleChartOption: (id: ChartOption['id']) => void
  onClose: () => void
}

function CustomizeDrawer({
  density,
  onDensityChange,
  visibleSections,
  onToggleSection,
  chartOptions,
  onToggleChartOption,
  onClose,
}: CustomizeDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSectionKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggleSection(id)
    }
  }

  return (
    <>
      <div className="customize-drawer-backdrop" onClick={onClose} />
      <div ref={drawerRef} className="customize-drawer" role="dialog" aria-label="Customize dashboard">
        <div className="customize-drawer-header">
          <h2 className="customize-drawer-title">Customize</h2>
          <button type="button" className="customize-drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="customize-section">
          <span className="customize-section-label">Display Density</span>
          <div className="customize-density-options" role="radiogroup" aria-label="Display density">
            {DENSITY_OPTIONS.map((option) => (
              <label key={option} className="customize-density-option">
                <input
                  type="radio"
                  name="display-density"
                  value={option}
                  checked={density === option}
                  onChange={() => onDensityChange(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="customize-section">
          <span className="customize-section-label">Sections</span>
          <ul className="customize-toggle-list">
            {SECTION_OPTIONS.map((section) => (
              <li key={section.id}>
                <label
                  className="customize-toggle-row"
                  tabIndex={0}
                  onKeyDown={(event) => handleSectionKeyDown(event, section.id)}
                >
                  <input
                    type="checkbox"
                    checked={visibleSections[section.id] ?? true}
                    onChange={() => onToggleSection(section.id)}
                  />
                  {section.label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="customize-section">
          <span className="customize-section-label">Chart Options</span>
          <ul className="customize-toggle-list">
            {CHART_OPTIONS.map((option) => (
              <li key={option.id}>
                <label className="customize-toggle-row">
                  <input
                    type="checkbox"
                    checked={chartOptions[option.id]}
                    onChange={() => onToggleChartOption(option.id)}
                  />
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default CustomizeDrawer
