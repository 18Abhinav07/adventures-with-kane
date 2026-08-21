import { NAV_SECTIONS } from './navItems'
import { useAppState } from '../../hooks/useAppState'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { state, dispatch } = useAppState()

  return (
    <nav className={styles.sidebar} aria-label="Primary navigation">
      <div className={styles.scroll}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className={styles.section}>
            <div className={styles.heading}>{section.heading}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              const active = state.activeNavigation === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={[styles.item, active ? styles.active : ''].join(' ')}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => dispatch({ type: 'SET_NAV', id: item.id })}
                >
                  <Icon size={16} className={styles.icon} aria-hidden="true" />
                  <span className={styles.label}>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={styles.envBlock}>
        <span className={styles.envTitle}>DEMO ENVIRONMENT</span>
        <span className={styles.envSubtitle}>Market data simulated</span>
      </div>
    </nav>
  )
}
