# PRD — Room Booking Studio

A single-page room booking widget. Functional correctness AND the specific
visual/interaction details below are both hard requirements — this is not
a "make it look nice" suggestion, every value is exact and must be
implemented as written.

## 1. Design tokens (exact values — do not substitute similar colors)

- Background: `#0F1115`
- Surface / card background: `#181B21`
- Border: `#2A2F3A`
- Text primary: `#F5F6F8`
- Text secondary: `#9AA1AC`
- Accent / primary action color: `#5B8CFF`
- Room color palette, assigned in this exact order as rooms are created
  (5th room and beyond wraps back to the start): `#5B8CFF` (1st room),
  `#33C481` (2nd), `#FF8A5B` (3rd), `#C97BFF` (4th), `#FF5B7A` (5th).
- Spacing scale: only use 4px / 8px / 12px / 16px / 24px / 32px for
  padding, margin, and gap — no arbitrary pixel values.
- Corner radius: 8px on inputs and buttons, 12px on cards and toasts.
- Font: system UI stack (`system-ui, -apple-system, sans-serif`).
  Body text 14px. Page title 24px, bold. Field labels 12px, uppercase,
  letter-spacing 0.04em.

## 2. Layout (exact structure and positions)

- Page header row: page title "Room Booking Studio" on the left, a
  theme toggle button on the right, same row, vertically centered,
  16px padding around the row.
- Booking form: a card (surface background, border, 12px radius),
  max-width 480px, directly below the header.
- Inside the form: a room selector row above the time/title fields.
  The room selector is a horizontal row of "chips" — one chip per
  existing room plus a trailing "+ New Room" chip — each chip is a
  small colored dot (matching that room's palette color) followed by
  the room name, with 8px gap between chips. The currently-selected
  chip has a 2px border in its room color; unselected chips have a
  1px border in the default border color.
- Below the room selector: Start Time field, End Time field, Title
  field, then the "Book" submit button.
- Bookings list: below the form, in its own card. Each booking row has
  a 4px-wide colored left border matching its room's palette color,
  and shows (left to right): the room name as a small colored pill
  (background = room color at low opacity, text = room color), the
  time range, the booking title, and a cancel button on the far right.
- The cancel button is invisible (`opacity: 0`) by default and fades to
  visible (`opacity: 1`, 150ms transition) only while its row is
  hovered or focused.

## 3. Interaction and state detail

- **Creating a room:** clicking the "+ New Room" chip replaces it with
  an inline text input, preceded by a small colored dot already showing
  the color the new room will get (the next color in the palette
  sequence). Submitting (Enter) with a non-empty name adds the room as
  a new selectable chip and selects it. Submitting an empty name shows
  an inline error below the input (not a toast) and does not add a room.
- **Per-room overlap scoping:** the overlap/validity rules below apply
  per room. Two bookings in different rooms may occupy the exact same
  or an overlapping time range. Only two bookings in the *same* room
  may conflict.
- **Validation rule:** a booking is valid only if start time is
  strictly before end time. Two bookings in the same room are allowed
  to touch (one ending exactly when the next begins) — only genuine
  overlaps (not touching) must be rejected.
- **Conflict feedback (same-room overlap or invalid range):** submitting
  such a booking must NOT show a static error message only. It must:
  (a) trigger a 250ms horizontal shake animation on the form card,
  (b) give the End Time field a 2px border in `#FF5B7A`,
  (c) show inline error text in `#FF5B7A` directly below the End Time
  field, fading in over 150ms. The error must not appear as a toast.
- **Successful booking:** submitting a valid booking clears the form
  fields and shows a toast notification in the bottom-right corner of
  the viewport (16px inset from both edges). The toast slides in from
  the right (200ms ease-out), and auto-dismisses after 4 seconds via a
  shrinking progress bar rendered along its bottom edge. If multiple
  toasts are shown in quick succession they stack vertically, newest
  at the bottom, with 8px gaps between them.
- **Cancelling a booking:** clicking a row's cancel button removes that
  booking immediately and shows an "Undo" toast (same toast component)
  visible for 5 seconds. Clicking "Undo" inside that toast restores the
  exact same booking (same room, time range, and title) to the list.
  If the Undo toast expires or is dismissed without being clicked, the
  cancellation is permanent.
- **Theme toggle:** clicking it switches every token above to a light
  variant: background `#F5F6F8`, surface `#FFFFFF`, text primary
  `#0F1115`, text secondary unchanged in role but recolored to fit,
  border `#E2E5EA`. Accent and room palette colors do NOT change
  between themes. The chosen theme is persisted to `localStorage`
  under the exact key `booking-studio-theme`, and on page load the
  app must render in whichever theme was last stored (defaulting to
  the dark variant above if nothing is stored yet).
- **Empty state:** when there are zero bookings across all rooms, the
  bookings list card shows centered, secondary-colored text reading
  exactly "No bookings yet" instead of an empty list or nothing.
- **Keyboard behavior:** pressing Escape dismisses the room-creation
  inline input if it is open; if it is not open, Escape instead
  dismisses the most recently shown toast, if one is visible. The
  booking form must submit when Enter is pressed in any of its fields
  (Start Time, End Time, or Title).

## 4. Out of scope (do not build)

- Deleting a room entirely (a room with zero bookings must still stay
  visible in the selector — it just can't be removed).
- User accounts, authentication, or any backend/persistence beyond
  `localStorage` for the theme preference (bookings themselves do not
  need to persist across reloads).
- Multi-day or calendar-grid views — this is a single flat list of
  bookings across all rooms, filterable only by which room a booking
  belongs to via its colored pill/border, not by an actual filter
  control.
