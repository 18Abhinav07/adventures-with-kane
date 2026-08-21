import type { RefObject } from 'react'
import { Popover } from '../overlays/Popover'
import { useAppState } from '../../hooks/useAppState'
import styles from './ProfilePopover.module.css'

export function ProfilePopover({ anchorRef }: { anchorRef: RefObject<HTMLElement | null> }) {
  const { state, dispatch, addToast } = useAppState()

  function handleAction(label: string) {
    dispatch({ type: 'CLOSE_PROFILE_POPOVER' })
    addToast(label, `${label} is not available in this demo environment.`)
  }

  return (
    <Popover
      open={state.profilePopoverOpen}
      anchorRef={anchorRef}
      onClose={() => dispatch({ type: 'CLOSE_PROFILE_POPOVER' })}
      width={240}
      align="end"
    >
      <div className={styles.header}>
        <div className={styles.avatar}>AP</div>
        <div>
          <div className={styles.name}>ABHINAV PANGARIA</div>
          <div className={styles.role}>Portfolio Manager</div>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Workspace</span>
        <span className={styles.fieldValue}>Institutional Demo</span>
      </div>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Status</span>
        <span className={styles.fieldValue}>Active</span>
      </div>

      <div className={styles.divider} />

      <button type="button" className={styles.action} onClick={() => handleAction('Preferences')}>
        Preferences
      </button>
      <button type="button" className={styles.action} onClick={() => handleAction('Keyboard shortcuts')}>
        Keyboard shortcuts
      </button>
      <button type="button" className={styles.action} onClick={() => handleAction('Sign out')}>
        Sign out
      </button>
    </Popover>
  )
}
