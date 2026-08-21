import { useEffect, useRef, useState } from 'react'
import { EXPORT_ACTIONS, EXPORT_FORMATS, DEFAULT_EXPORT_FORMAT, type ExportFormat } from '../data/exports'
import './ExportPopover.css'

interface ExportPopoverProps {
  anchorRect: { top: number; left: number; bottom: number }
  onClose: () => void
}

function ExportPopover({ anchorRect, onClose }: ExportPopoverProps) {
  const [format, setFormat] = useState<ExportFormat>(DEFAULT_EXPORT_FORMAT)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [onClose])

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 2500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const handleQueueExport = (title: string) => {
    setToastMessage(`${title} queued as ${format}`)
  }

  return (
    <>
      <div
        ref={popoverRef}
        className="export-popover"
        style={{ top: anchorRect.bottom + 8, left: anchorRect.left }}
      >
        <ul className="export-action-list">
          {EXPORT_ACTIONS.map((action) => (
            <li key={action.id}>
              <button type="button" className="export-action-row" onClick={() => handleQueueExport(action.title)}>
                <span className="export-action-icon">{action.icon}</span>
                <span className="export-action-text">
                  <span className="export-action-title">{action.title}</span>
                  <span className="export-action-description">{action.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="export-format-section">
          <span className="export-format-label">Format</span>
          <div className="export-format-options" role="radiogroup" aria-label="Export format">
            {EXPORT_FORMATS.map((option) => (
              <label key={option} className="export-format-option">
                <input
                  type="radio"
                  name="export-format"
                  value={option}
                  checked={format === option}
                  onChange={() => setFormat(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="export-toast" role="status">
          {toastMessage}
        </div>
      )}
    </>
  )
}

export default ExportPopover
