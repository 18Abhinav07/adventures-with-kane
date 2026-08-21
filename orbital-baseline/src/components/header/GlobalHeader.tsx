import { useRef } from 'react'
import { Bell } from 'lucide-react'
import { LogoMark } from './Logo'
import { SearchField } from './SearchField'
import { ClockDisplay } from './ClockDisplay'
import { useAppState } from '../../hooks/useAppState'
import { ProfilePopover } from '../controls/ProfilePopover'
import styles from './GlobalHeader.module.css'

interface GlobalHeaderProps {
  searchInputRef: React.RefObject<HTMLInputElement>
}

export function GlobalHeader({ searchInputRef }: GlobalHeaderProps) {
  const { state, dispatch } = useAppState()
  const avatarRef = useRef<HTMLButtonElement>(null)

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <LogoMark />
          <span className={styles.wordmark}>ORBITAL</span>
        </div>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.marketLabel}>GLOBAL MARKET</span>
        <span className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" />
          OPEN
        </span>
      </div>

      <div className={styles.center}>
        <SearchField ref={searchInputRef} />
      </div>

      <div className={styles.right}>
        <ClockDisplay />
        <button type="button" className={styles.iconButton} aria-label="Notifications, 3 unread">
          <Bell size={16} />
          <span className={styles.badge}>3</span>
        </button>
        <button
          ref={avatarRef}
          type="button"
          className={styles.avatar}
          aria-label="Open profile menu"
          aria-expanded={state.profilePopoverOpen}
          onClick={() => dispatch({ type: 'TOGGLE_PROFILE_POPOVER' })}
        >
          AP
        </button>
        <ProfilePopover anchorRef={avatarRef} />
      </div>
    </header>
  )
}
