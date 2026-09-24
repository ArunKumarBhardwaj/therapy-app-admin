export function formatPrice(price: number) {
  if (price <= 0) return 'Price not set'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDuration(minutes: number) {
  return `${minutes} min`
}

export function formatVisit(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Time not set'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatStatus(status: string) {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
