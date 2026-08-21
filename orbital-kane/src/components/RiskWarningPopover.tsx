import { useEffect, useRef } from 'react'
import { CONCENTRATION_WARNING } from '../data/risk'
import './RiskWarningPopover.css'

interface RiskWarningPopoverProps {
  anchorRect: { top: number; left: number; bottom: number }
  onClose: () => void
}

function RiskWarningPopover({ anchorRect, onClose }: RiskWarningPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [onClose])

  return (
    <div
      ref={popoverRef}
      className="risk-warning-popover"
      style={{ top: anchorRect.bottom + 8, left: anchorRect.left }}
      role="dialog"
      aria-label="Technology overweight warning"
    >
      <div className="risk-warning-title">{CONCENTRATION_WARNING.title}</div>

      <div className="risk-warning-row">
        <span className="risk-warning-label">Current allocation</span>
        <span className="risk-warning-value">{CONCENTRATION_WARNING.currentAllocation}%</span>
      </div>
      <div className="risk-warning-row">
        <span className="risk-warning-label">Target</span>
        <span className="risk-warning-value">{CONCENTRATION_WARNING.target}%</span>
      </div>
      <div className="risk-warning-row">
        <span className="risk-warning-label">Deviation</span>
        <span className="risk-warning-value positive-deviation">
          +{CONCENTRATION_WARNING.deviation}%
        </span>
      </div>

      <div className="risk-warning-action-label">Recommended action</div>
      <div className="risk-warning-action">{CONCENTRATION_WARNING.recommendedAction}</div>
    </div>
  )
}

export default RiskWarningPopover
