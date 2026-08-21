import { useState } from 'react'
import './App.css'

// Converts "HH:MM" into minutes-since-midnight so ranges can be compared
// with plain integer arithmetic instead of string/Date comparisons.
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Two ranges overlap when one starts strictly before the other ends, on
// both sides. Ranges that only "touch" (a.end === b.start) are NOT an
// overlap because the comparison is strict (<), not (<=).
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

let nextId = 1

function App() {
  const [bookings, setBookings] = useState([])
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required.')
      return
    }
    if (!startTime || !endTime) {
      setError('Start and end time are required.')
      return
    }

    const startMin = toMinutes(startTime)
    const endMin = toMinutes(endTime)

    // Rule: end time must be strictly after start time.
    if (endMin <= startMin) {
      setError('End time must be after start time.')
      return
    }

    // Rule: reject if the new range overlaps any existing booking.
    // Touching ranges (end === start) are allowed, handled by the
    // strict-less-than comparisons in rangesOverlap.
    const conflict = bookings.some((b) =>
      rangesOverlap(startMin, endMin, toMinutes(b.startTime), toMinutes(b.endTime))
    )
    if (conflict) {
      setError('This time range overlaps an existing booking.')
      return
    }

    const newBooking = {
      id: nextId++,
      title: trimmedTitle,
      startTime,
      endTime,
    }

    setBookings((prev) =>
      [...prev, newBooking].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
    )
    setTitle('')
    setStartTime('')
    setEndTime('')
  }

  function handleCancel(id) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="booking-widget">
      <h1>Room Booking</h1>

      <form onSubmit={handleSubmit} className="booking-form" noValidate>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Team standup"
          />
        </div>

        <div className="field">
          <label htmlFor="start-time">Start time</label>
          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="end-time">End time</label>
          <input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <button type="submit">Book room</button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <h2>Bookings</h2>
      {bookings.length === 0 ? (
        <p className="empty">No bookings yet.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((b) => (
            <li key={b.id} className="booking-item">
              <span className="booking-time">
                {b.startTime}&ndash;{b.endTime}
              </span>
              <span className="booking-title">{b.title}</span>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => handleCancel(b.id)}
                aria-label={`Cancel booking ${b.title}`}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
