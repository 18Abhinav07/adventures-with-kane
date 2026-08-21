import { useState, type RefObject } from 'react'
import { FileSpreadsheet, Briefcase, ArrowLeftRight, ShieldAlert } from 'lucide-react'
import { Popover } from '../overlays/Popover'
import { useAppState } from '../../hooks/useAppState'
import { getExportOptions } from '../../data/preferences'
import type { ExportFormat } from '../../types'
import styles from './ExportPopover.module.css'

const ICONS = {
  'current-view': FileSpreadsheet,
  holdings: Briefcase,
  transactions: ArrowLeftRight,
  'risk-report': ShieldAlert,
} as const

const FORMATS: readonly ExportFormat[] = ['CSV', 'JSON', 'PDF']

export function ExportPopover({ anchorRef }: { anchorRef: RefObject<HTMLElement | null> }) {
  const { state, dispatch, addToast } = useAppState()
  const [format, setFormat] = useState<ExportFormat>('CSV')
  const options = getExportOptions()

  function handleSelect(title: string) {
    dispatch({ type: 'CLOSE_EXPORT_POPOVER' })
    addToast('Export queued', `Your ${format} export is being prepared.`)
    void title
  }

  return (
    <Popover
      open={state.exportPopoverOpen}
      anchorRef={anchorRef}
      onClose={() => dispatch({ type: 'CLOSE_EXPORT_POPOVER' })}
      width={280}
      align="end"
    >
      <div className={styles.list}>
        {options.map((opt) => {
          const Icon = ICONS[opt.id]
          return (
            <button key={opt.id} type="button" className={styles.option} onClick={() => handleSelect(opt.title)}>
              <Icon size={16} className={styles.optionIcon} aria-hidden="true" />
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{opt.title}</span>
                <span className={styles.optionDescription}>{opt.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className={styles.divider} />

      <fieldset className={styles.formatFieldset}>
        <legend className={styles.formatLabel}>Format</legend>
        <div className={styles.formatOptions}>
          {FORMATS.map((f) => (
            <label key={f} className={styles.formatOption}>
              <input
                type="radio"
                name="export-format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
              />
              {f}
            </label>
          ))}
        </div>
      </fieldset>
    </Popover>
  )
}
