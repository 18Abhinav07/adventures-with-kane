import { useState } from 'react'
import './App.css'

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart
}

function App() {
  const [bookings, setBookings] = useState([])
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title || !start || !end) {
      setError('Title, start time, and end time are all required.')
      return
    }

    const startMin = toMinutes(start)
    const endMin = toMinutes(end)

    if (endMin <= startMin) {
      setError('End time must be after start time.')
      return
    }

    const conflict = bookings.some((b) =>
      overlaps(startMin, endMin, toMinutes(b.start), toMinutes(b.end))
    )
    if (conflict) {
      setError('This time range overlaps an existing booking.')
      return
    }

    setBookings((prev) =>
      [...prev, { id: crypto.randomUUID(), title, start, end }].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start)
      )
    )
    setTitle('')
    setStart('')
    setEnd('')
  }

  function handleCancel(id) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <section id="booking-widget">
      <h1>Room Booking</h1>

      <form onSubmit={handleSubmit} aria-label="New booking">
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Team sync"
          />
        </label>
        <label>
          Start
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          End
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button type="submit">Book</button>
      </form>

      {error && <p role="alert" className="booking-error">{error}</p>}

      <ul className="booking-list">
        {bookings.map((b) => (
          <li key={b.id} className="booking-item">
            <span>
              {b.title} ({b.start}–{b.end})
            </span>
            <button type="button" onClick={() => handleCancel(b.id)}>
              Cancel
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default App
