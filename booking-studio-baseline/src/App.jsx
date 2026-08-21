import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

const THEME_KEY = 'booking-studio-theme'
const PALETTE = ['#5B8CFF', '#33C481', '#FF8A5B', '#C97BFF', '#FF5B7A']

let idCounter = 1
function nextId(prefix) {
  return `${prefix}-${idCounter++}-${Date.now().toString(36)}`
}

function timesOverlap(aStart, aEnd, bStart, bEnd) {
  // strict overlap only; touching (aEnd === bStart etc) is allowed
  return aStart < bEnd && bStart < aEnd
}

function formatRange(start, end) {
  return `${start} - ${end}`
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function Toast({ toast, onDismiss, onUndo }) {
  return (
    <div className="toast" role="status">
      <div className="toast-body">
        <span className="toast-message">{toast.message}</span>
        {toast.type === 'undo' && (
          <button className="toast-undo-btn" onClick={() => onUndo(toast)}>
            Undo
          </button>
        )}
        <button
          className="toast-close-btn"
          aria-label="Dismiss"
          onClick={() => onDismiss(toast.id)}
        >
          ×
        </button>
      </div>
      <div className="toast-progress-track">
        <div
          className="toast-progress-bar"
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'dark'
  })

  const [rooms, setRooms] = useState(() => [
    { id: nextId('room'), name: 'Sunroom', color: PALETTE[0] },
  ])
  const [selectedRoomId, setSelectedRoomId] = useState(() => rooms[0]?.id)
  const [bookings, setBookings] = useState([])

  const [creatingRoom, setCreatingRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomError, setNewRoomError] = useState('')
  const newRoomInputRef = useRef(null)

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [title, setTitle] = useState('')
  const [formError, setFormError] = useState('')
  const [shakeToken, setShakeToken] = useState(0)

  const [toasts, setToasts] = useState([])
  const toastTimers = useRef({})

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (creatingRoom && newRoomInputRef.current) {
      newRoomInputRef.current.focus()
    }
  }, [creatingRoom])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id])
      delete toastTimers.current[id]
    }
  }, [])

  const pushToast = useCallback((toast) => {
    setToasts((prev) => [...prev, toast])
    const timer = setTimeout(() => {
      dismissToast(toast.id)
    }, toast.duration)
    toastTimers.current[toast.id] = timer
  }, [dismissToast])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return
      if (creatingRoom) {
        setCreatingRoom(false)
        setNewRoomName('')
        setNewRoomError('')
      } else if (toasts.length > 0) {
        const last = toasts[toasts.length - 1]
        dismissToast(last.id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [creatingRoom, toasts, dismissToast])

  useEffect(() => {
    return () => {
      Object.values(toastTimers.current).forEach(clearTimeout)
    }
  }, [])

  function nextRoomColor() {
    return PALETTE[rooms.length % PALETTE.length]
  }

  function handleSelectRoom(roomId) {
    setSelectedRoomId(roomId)
  }

  function handleStartCreateRoom() {
    setCreatingRoom(true)
    setNewRoomName('')
    setNewRoomError('')
  }

  function handleSubmitNewRoom(e) {
    e.preventDefault()
    const trimmed = newRoomName.trim()
    if (!trimmed) {
      setNewRoomError('Room name cannot be empty')
      return
    }
    const color = nextRoomColor()
    const room = { id: nextId('room'), name: trimmed, color }
    setRooms((prev) => [...prev, room])
    setSelectedRoomId(room.id)
    setCreatingRoom(false)
    setNewRoomName('')
    setNewRoomError('')
  }

  function handleCancelNewRoom() {
    setCreatingRoom(false)
    setNewRoomName('')
    setNewRoomError('')
  }

  function triggerConflictFeedback(message) {
    setFormError(message)
    setShakeToken((t) => t + 1)
  }

  function handleSubmitBooking(e) {
    e.preventDefault()
    if (!selectedRoomId) return

    if (!startTime || !endTime || !title.trim()) {
      triggerConflictFeedback('Please fill in all fields')
      return
    }

    if (!(startTime < endTime)) {
      triggerConflictFeedback('Start time must be before end time')
      return
    }

    const conflict = bookings.some(
      (b) =>
        b.roomId === selectedRoomId &&
        timesOverlap(startTime, endTime, b.start, b.end)
    )

    if (conflict) {
      triggerConflictFeedback('This time overlaps an existing booking in this room')
      return
    }

    const booking = {
      id: nextId('booking'),
      roomId: selectedRoomId,
      start: startTime,
      end: endTime,
      title: title.trim(),
    }
    setBookings((prev) => [...prev, booking])
    setStartTime('')
    setEndTime('')
    setTitle('')
    setFormError('')

    const room = rooms.find((r) => r.id === selectedRoomId)
    pushToast({
      id: nextId('toast'),
      type: 'success',
      message: `Booked "${booking.title}" in ${room ? room.name : 'room'}`,
      duration: 4000,
    })
  }

  function handleCancelBooking(booking) {
    setBookings((prev) => prev.filter((b) => b.id !== booking.id))
    pushToast({
      id: nextId('toast'),
      type: 'undo',
      message: 'Booking cancelled',
      duration: 5000,
      booking,
    })
  }

  function handleUndo(toast) {
    if (toast.booking) {
      setBookings((prev) => [...prev, toast.booking])
    }
    dismissToast(toast.id)
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]))
  const nextColor = nextRoomColor()

  return (
    <div className="page">
      <header className="header-row">
        <h1 className="page-title">Room Booking Studio</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <main className="main-content">
        <form
          className={`booking-form card ${shakeToken ? 'shake' : ''}`}
          key={shakeToken}
          onSubmit={handleSubmitBooking}
        >
          <div className="room-selector">
            {rooms.map((room) => (
              <button
                type="button"
                key={room.id}
                className={`chip ${selectedRoomId === room.id ? 'chip-selected' : ''}`}
                style={{
                  borderColor: selectedRoomId === room.id ? room.color : undefined,
                }}
                onClick={() => handleSelectRoom(room.id)}
              >
                <span className="chip-dot" style={{ backgroundColor: room.color }} />
                <span className="chip-label">{room.name}</span>
              </button>
            ))}

            {creatingRoom ? (
              <form className="chip chip-new-form" onSubmit={handleSubmitNewRoom}>
                <span className="chip-dot" style={{ backgroundColor: nextColor }} />
                <input
                  ref={newRoomInputRef}
                  className="chip-new-input"
                  type="text"
                  value={newRoomName}
                  placeholder="Room name"
                  onChange={(e) => {
                    setNewRoomName(e.target.value)
                    if (newRoomError) setNewRoomError('')
                  }}
                  onBlur={handleCancelNewRoom}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </form>
            ) : (
              <button type="button" className="chip chip-add" onClick={handleStartCreateRoom}>
                + New Room
              </button>
            )}
          </div>
          {creatingRoom && newRoomError && (
            <div className="inline-error new-room-error">{newRoomError}</div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="start-time">
              Start Time
            </label>
            <input
              id="start-time"
              className="field-input"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="end-time">
              End Time
            </label>
            <input
              id="end-time"
              className={`field-input ${formError ? 'field-input-error' : ''}`}
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            {formError && <div className="inline-error fade-in">{formError}</div>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="booking-title">
              Title
            </label>
            <input
              id="booking-title"
              className="field-input"
              type="text"
              value={title}
              placeholder="Meeting title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            Book
          </button>
        </form>

        <section className="bookings-list card">
          {bookings.length === 0 ? (
            <div className="empty-state">No bookings yet</div>
          ) : (
            bookings.map((booking) => {
              const room = roomById[booking.roomId]
              const color = room ? room.color : '#5B8CFF'
              return (
                <div
                  className="booking-row"
                  key={booking.id}
                  style={{ borderLeftColor: color }}
                  tabIndex={0}
                >
                  <span
                    className="room-pill"
                    style={{
                      backgroundColor: hexToRgba(color, 0.16),
                      color,
                    }}
                  >
                    {room ? room.name : 'Unknown room'}
                  </span>
                  <span className="booking-time">{formatRange(booking.start, booking.end)}</span>
                  <span className="booking-title">{booking.title}</span>
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelBooking(booking)}
                  >
                    Cancel
                  </button>
                </div>
              )
            })
          )}
        </section>
      </main>

      <div className="toast-stack">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} onUndo={handleUndo} />
        ))}
      </div>
    </div>
  )
}
