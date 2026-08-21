# PRD sections (confirmed use-cases) and resolved ambiguities

No human was available to grill interactively in this automated run (auto mode). Ambiguities
were resolved conservatively, favoring the PRD's literal wording, and are recorded here so the
convention survives even though `.testmuai/task-tracker.md` gets fully rewritten by the Stop hook
on every run (it only preserves the YAML fence, not surrounding prose).

## Confirmed use-cases -> tasks

- T1 — Design tokens, header layout ("Room Booking Studio" title left, theme toggle right,
  16px padding, vertically centered), theme toggle button exists and is clickable.
  `verification_mode: kane` (browser-observable: layout, colors, fonts).
- T2 — Room selector chips: dot + name, 8px gaps, selected = 2px colored border / unselected =
  1px default border; "+ New Room" trailing chip -> inline input with dot preview of next
  palette color; Enter with non-empty name adds + selects room; Enter with empty name shows
  inline error (not toast) and does not add a room. `verification_mode: kane`.
- T3 — Booking form (Start Time, End Time, Title, Book button) + per-room overlap scoping:
  identical/overlapping ranges are fine across different rooms; only same-room bookings can
  conflict; touching (end == next start) is allowed, not a conflict. `verification_mode: kane`.
- T4 — Conflict feedback: invalid range or same-room overlap triggers 250ms horizontal shake on
  the form card, 2px `#FF5B7A` border on End Time, inline error text in `#FF5B7A` under End Time
  fading in over 150ms, and explicitly NOT a toast. `verification_mode: kane`.
- T5 — Success toast: clears form fields (room selection persists — see convention #5 below),
  slides in from the right over 200ms ease-out in the bottom-right corner (16px inset), shows a
  shrinking progress bar, auto-dismisses at 4s, stacks newest-at-bottom with 8px gaps for rapid
  successive toasts. `verification_mode: kane`.
- T6 — Cancel a booking: removes it immediately, shows an Undo toast (same component) visible
  5s; clicking Undo restores the exact same booking (room/time/title); expiring or dismissing
  without clicking makes the cancellation permanent. `verification_mode: kane`.
- T7 — Theme toggle switches to the light variant tokens (accent + room palette colors do NOT
  change), persists to `localStorage['booking-studio-theme']`, and on reload renders whichever
  theme was last stored (dark by default if unset). `verification_mode: kane`.
- T8 — Empty state: zero bookings across all rooms shows centered secondary-colored text reading
  exactly "No bookings yet". `verification_mode: kane`.
- T9 — Keyboard: Escape closes the open room-creation input if present, else dismisses the most
  recently added toast if one is visible; Enter in Start Time / End Time / Title submits the
  booking form. `verification_mode: kane`.

## Resolved ambiguities (conventions)

1. Room chip order: existing rooms in creation order, "+ New Room" chip always trailing.
2. Room color assignment: `palette[roomIndex % 5]`, roomIndex = 0-based creation order (6th room
   wraps to palette[0], etc). The inline "+ New Room" input's dot preview shows
   `palette[rooms.length % 5]` before submission, matching what the room will actually get.
3. Undo toast reuses the same toast component/visuals (slide-in, progress bar) but with a 5s
   duration instead of 4s, and an "Undo" action button.
4. Escape dismisses the most-recently-ADDED toast (the one rendered at the bottom of the stack,
   since newest renders at the bottom per PRD's stacking rule).
5. "Clears the form fields" on successful booking = Start Time, End Time, Title reset to empty;
   selected room stays selected (lets a user add several bookings to the same room quickly
   without re-selecting it every time).
6. Time fields use native `<input type="time">`.
7. Empty-room-name inline error uses the same `#FF5B7A` error color defined for the End Time
   conflict error (the PRD only ever defines one error color).
8. Title is a soft requirement enforced in JS, not HTML `required`: submitting with an empty
   title while the time range is otherwise valid silently no-ops (no booking, no toast, no
   shake). This is deliberate — an HTML `required` attribute would block the native submit event
   before JS ever runs, which would suppress the specified shake/red-border/inline-error conflict
   feedback whenever Title happened to be empty too. Conflict validation (bad range / same-room
   overlap) is checked first and fires independently of Title's state, per PRD section 3's
   "Conflict feedback" bullet, which never mentions Title as a precondition.
