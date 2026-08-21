import { NAV_SECTIONS } from '../data/navigation'
import './Sidebar.css'

interface SidebarProps {
  activeLabel: string
  onActivate: (label: string) => void
}

function Sidebar({ activeLabel, onActivate }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Dashboard navigation">
      <div className="sidebar-sections">
        {NAV_SECTIONS.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            <ul className="sidebar-list">
              {section.items.map((item) => {
                const isActive = item.label === activeLabel
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      className={`sidebar-item${isActive ? ' active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => onActivate(item.label)}
                    >
                      <Icon className="sidebar-item-icon" size={16} strokeWidth={1.75} aria-hidden="true" />
                      <span className="sidebar-item-label">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="sidebar-environment">
        <div className="sidebar-environment-title">DEMO ENVIRONMENT</div>
        <div className="sidebar-environment-subtitle">Market data simulated</div>
      </div>
    </nav>
  )
}

export default Sidebar
