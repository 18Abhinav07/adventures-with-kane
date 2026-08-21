import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import ProfilePopover from './ProfilePopover'
import './Header.css'

function formatUtcClock(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, '0')
  const m = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  return `UTC ${h}:${m}:${s}`
}

function Header() {
  const [clock, setClock] = useState(() => formatUtcClock(new Date()))
  const [profileOpen, setProfileOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<{
    top: number
    left: number
    bottom: number
    right: number
  } | null>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => {
      setClock(formatUtcClock(new Date()))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSearchValue('')
      searchRef.current?.blur()
    }
  }

  const handleToggleProfile = () => {
    if (!profileOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect()
      setAnchorRect({ top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right })
    }
    setProfileOpen((current) => !current)
  }

  return (
    <header className="app-header">
      <div className="app-header-left">
        <div className="brand" aria-label="ORBITAL">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-ring" />
            <span className="brand-mark-core" />
          </span>
          <span className="brand-wordmark">ORBITAL</span>
        </div>
        <div className="market-status">
          <span className="market-status-label">GLOBAL MARKET</span>
          <span className="market-status-indicator">
            <span className="status-dot" aria-hidden="true" />
            OPEN
          </span>
        </div>
      </div>

      <div className="app-header-center">
        <input
          ref={searchRef}
          type="text"
          className="global-search"
          placeholder="Search assets, metrics, reports..."
          aria-label="Search assets, metrics, reports"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <span className="global-search-shortcut" aria-hidden="true">⌘K</span>
      </div>

      <div className="app-header-right">
        <span className="utc-clock">{clock}</span>
        <button type="button" className="icon-button" aria-label="Notifications">
          <Bell size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="notification-badge">3</span>
        </button>
        <button
          ref={avatarRef}
          type="button"
          className="avatar"
          aria-label="Profile"
          onClick={handleToggleProfile}
        >
          AP
        </button>
      </div>

      {profileOpen && anchorRect && (
        <ProfilePopover anchorRect={anchorRect} onClose={() => setProfileOpen(false)} />
      )}
    </header>
  )
}

export default Header
