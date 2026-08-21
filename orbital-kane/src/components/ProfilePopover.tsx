import { useEffect, useRef } from 'react'
import './ProfilePopover.css'

interface ProfilePopoverProps {
  anchorRect: { top: number; left: number; bottom: number; right: number }
  onClose: () => void
}

const PROFILE_ACTIONS = ['Preferences', 'Keyboard shortcuts', 'Sign out']

function ProfilePopover({ anchorRect, onClose }: ProfilePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    function handlePointerDown(event: MouseEvent) {
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

  const handleAction = () => {
    onClose()
  }

  return (
    <div
      ref={popoverRef}
      className="profile-popover"
      style={{ top: anchorRect.bottom + 8, right: window.innerWidth - anchorRect.right }}
    >
      <div className="profile-popover-identity">
        <div className="profile-popover-name">ABHINAV PANGARIA</div>
        <div className="profile-popover-role">Portfolio Manager</div>
      </div>

      <div className="profile-popover-detail-row">
        <span className="profile-popover-detail-label">Workspace</span>
        <span className="profile-popover-detail-value">Institutional Demo</span>
      </div>
      <div className="profile-popover-detail-row">
        <span className="profile-popover-detail-label">Status</span>
        <span className="profile-popover-detail-value">Active</span>
      </div>

      <ul className="profile-popover-actions">
        {PROFILE_ACTIONS.map((action) => (
          <li key={action}>
            <button type="button" className="profile-popover-action" onClick={handleAction}>
              {action}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProfilePopover
