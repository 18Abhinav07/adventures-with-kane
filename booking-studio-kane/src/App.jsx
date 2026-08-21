import { useEffect, useRef, useState } from 'react'
import './App.css'

const PALETTE = ['#5B8CFF', '#33C481', '#FF8A5B', '#C97BFF', '#FF5B7A']
const THEME_KEY = 'booking-studio-theme'

function colorForIndex(i) {
  return PALETTE[i % PALETTE.length]
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

let idCounter = 1
function nextId() {
  return idCounter++
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const [rooms, setRooms] = useState(() => [{ id: nextId(), name: 'Room A', color: colorForIndex(0) }])
  const [selectedRoomId, setSelectedRoomId] = useState(() => rooms[0]?.id ?? null)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [roomError, setRoomError] = useState('')

  const [bookings, setBookings] = useState([])

  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [title, setTitle] = useState('')
  const [conflict, setConflict] = useState('')
  const [shake, setShake] = useState(false)
  const shakeTimeoutRef = useRef(null)

  const [toasts, setToasts] = useState([])
  const toastTimersRef = useRef({})

  const newRoomInputRef = useRef(null)
  useEffect(() => {
    if (creatingRoom && newRoomInputRef.current) newRoomInputRef.current.focus()
  }, [creatingRoom])

  function selectedRoom() {
    return rooms.find(r => r.id === selectedRoomId) || null
  }

  function startCreatingRoom() {
    setCreatingRoom(true)
    setNewRoomName('')
    setRoomError('')
  }

  function cancelCreatingRoom() {
    setCreatingRoom(false)
    setNewRoomName('')
    setRoomError('')
  }

  function submitNewRoom() {
    const name = newRoomName.trim()
    if (!name) {
      setRoomError('Room name cannot be empty.')
      return
    }
    const room = { id: nextId(), name, color: colorForIndex(rooms.length) }
    setRooms(prev => [...prev, room])
    setSelectedRoomId(room.id)
    setCreatingRoom(false)
    setNewRoomName('')
    setRoomError('')
  }

  function addToast(toast) {
    const id = nextId()
    const full = { id, createdAt: Date.now(), ...toast }
    setToasts(prev => [...prev, full])
    const timer = setTimeout(() => dismissToast(id), toast.duration)
    toastTimersRef.current[id] = timer
    return id
  }

  function dismissToast(id) {
    clearTimeout(toastTimersRef.current[id])
    delete toastTimersRef.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function triggerConflict(message) {
    setConflict(message)
    setShake(true)
    clearTimeout(shakeTimeoutRef.current)
    shakeTimeoutRef.current = setTimeout(() => setShake(false), 250)
  }

  function handleSubmit(e) {
    e?.preventDefault?.()
    const room = selectedRoom()
    if (!room || !start || !end) return

    if (!(start < end)) {
      triggerConflict('End time must be after start time.')
      return
    }

    const overlaps = bookings.some(b =>
      b.roomId === room.id && start < b.end && b.start < end
    )
    if (overlaps) {
      triggerConflict('This room is already booked during that time.')
      return
    }

    if (!title.trim()) return

    const booking = { id: nextId(), roomId: room.id, start, end, title: title.trim() }
    setBookings(prev => [...prev, booking])
    setStart('')
    setEnd('')
    setTitle('')
    setConflict('')

    addToast({
      type: 'success',
      message: `Booked "${booking.title}" in ${room.name}, ${start}–${end}.`,
      duration: 4000,
    })
  }

  function cancelBooking(booking) {
    setBookings(prev => prev.filter(b => b.id !== booking.id))
    const room = rooms.find(r => r.id === booking.roomId)
    addToast({
      type: 'undo',
      message: `Cancelled "${booking.title}"${room ? ` in ${room.name}` : ''}.`,
      duration: 5000,
      booking,
    })
  }

  function undoCancel(toast) {
    setBookings(prev => [...prev, toast.booking])
    dismissToast(toast.id)
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Escape') return
      if (creatingRoom) {
        cancelCreatingRoom()
        return
      }
      setToasts(prev => {
        if (prev.length === 0) return prev
        const last = prev[prev.length - 1]
        clearTimeout(toastTimersRef.current[last.id])
        delete toastTimersRef.current[last.id]
        return prev.slice(0, -1)
      })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [creatingRoom])

  return (
    <div className="page">
      <div className="header-row">
        <h1 className="page-title">Room Booking Studio</h1>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      <form className={`card booking-form-card${shake ? ' shake' : ''}`} onSubmit={handleSubmit}>
        <div className="room-selector">
          {rooms.map(room => (
            <button
              type="button"
              key={room.id}
              className={`chip${room.id === selectedRoomId ? ' selected' : ''}`}
              style={{ '--chip-color': room.color }}
              onClick={() => setSelectedRoomId(room.id)}
            >
              <span className="chip-dot" style={{ '--chip-color': room.color }} />
              {room.name}
            </button>
          ))}

          {!creatingRoom && (
            <button type="button" className="chip" onClick={startCreatingRoom}>
              + New Room
            </button>
          )}

          {creatingRoom && (
            <span className="new-room-input">
              <span className="chip-dot" style={{ '--chip-color': colorForIndex(rooms.length) }} />
              <input
                ref={newRoomInputRef}
                type="text"
                value={newRoomName}
                placeholder="Room name"
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submitNewRoom()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    e.stopPropagation()
                    cancelCreatingRoom()
                  }
                }}
              />
            </span>
          )}
          {roomError && <div className="room-error">{roomError}</div>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="start-time">Start Time</label>
          <input
            id="start-time"
            type="time"
            value={start}
            onChange={e => setStart(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="end-time">End Time</label>
          <input
            id="end-time"
            type="time"
            className={conflict ? 'field-error' : ''}
            value={end}
            onChange={e => setEnd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
          {conflict && <div className="error-text">{conflict}</div>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="booking-title">Title</label>
          <input
            id="booking-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
        </div>

        <button type="submit" className="submit-btn">Book</button>
      </form>

      <div className="card bookings-card">
        {bookings.length === 0 && <div className="empty-state">No bookings yet</div>}
        {bookings.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId)
          const color = room?.color || '#5B8CFF'
          return (
            <div
              className="booking-row"
              key={booking.id}
              style={{ '--room-color': color, '--pill-bg': hexToRgba(color, 0.15) }}
            >
              <span className="room-pill">{room?.name || 'Unknown room'}</span>
              <span className="booking-time">{booking.start}–{booking.end}</span>
              <span className="booking-title">{booking.title}</span>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => cancelBooking(booking)}
              >
                Cancel
              </button>
            </div>
          )
        })}
      </div>

      <div className="toast-container">
        {toasts.map(toast => (
          <div className="toast" key={toast.id}>
            <div className="toast-message">{toast.message}</div>
            {toast.type === 'undo' && (
              <button type="button" className="toast-undo-btn" onClick={() => undoCancel(toast)}>
                Undo
              </button>
            )}
            <div className="toast-progress-track">
              <div
                className="toast-progress-bar"
                style={{ animationDuration: `${toast.duration}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
