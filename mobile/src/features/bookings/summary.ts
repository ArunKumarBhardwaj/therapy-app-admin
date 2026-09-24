import type { Booking } from '@/lib/domain'

export function isUpcoming(booking: Booking, now = Date.now()) {
  if (booking.status !== 'pending' && booking.status !== 'confirmed') return false
  const time = new Date(booking.preferredAt).getTime()
  return Number.isNaN(time) || time >= now
}

export function summarize(bookings: Booking[]) {
  const now = Date.now()
  const upcoming = bookings
    .filter((booking) => isUpcoming(booking, now))
    .sort((a, b) => a.preferredAt.localeCompare(b.preferredAt))
  const past = bookings.filter((booking) => !isUpcoming(booking, now))
  return {
    upcoming,
    past,
    next: upcoming[0] ?? null,
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    completed: bookings.filter((booking) => booking.status === 'completed').length,
  }
}
