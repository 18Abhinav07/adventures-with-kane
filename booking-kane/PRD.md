# PRD — Room Booking Widget

## 1. Create booking
User enters a title, start time, and end time (HH:MM, same day), and
submits to book the room for that range.

## 2. Reject overlapping bookings
If the new range overlaps any existing booking, reject it with a visible
error and do not create it. Two bookings that merely touch (one's end
time equals the other's start time) are NOT overlapping and must be
allowed.

## 3. Reject invalid ranges
If end time is not after start time, reject with a visible error and do
not create a booking.

## 4. Cancel booking
User can cancel an existing booking. Once cancelled, its time range is
free and a new booking may be created over it.
