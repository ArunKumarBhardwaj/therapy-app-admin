export type Role = 'user' | 'admin'

export type Profile = {
  id: string
  fullName: string | null
  email: string | null
  phone: string | null
  role: Role
}

export type Service = {
  id: string
  title: string
  description: string
  imagePath: string | null
  videoPath: string | null
  price: number
  durationMinutes: number
  isActive: boolean
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type Booking = {
  id: string
  serviceId: string
  preferredAt: string
  status: BookingStatus
  notes: string | null
  serviceTitle: string | null
}

export const SERVICE_MEDIA_BUCKET = 'service-media'

const SERVICE_COLUMNS =
  'id, title, description, image_path, video_path, price, duration_minutes, is_active'

export { SERVICE_COLUMNS }

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) return null
  return value as Record<string, unknown>
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asRole(value: unknown): Role | null {
  return value === 'user' || value === 'admin' ? value : null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function asStatus(value: unknown): BookingStatus | null {
  if (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'cancelled' ||
    value === 'completed'
  ) {
    return value
  }
  return null
}

export function parseProfile(row: unknown, email: string | null): Profile | null {
  const record = asRecord(row)
  if (!record || typeof record.id !== 'string') return null
  const role = asRole(record.role)
  if (!role) return null
  return {
    id: record.id,
    fullName: asNullableString(record.full_name),
    email,
    phone: asNullableString(record.phone),
    role,
  }
}

export function parseService(row: unknown): Service | null {
  const record = asRecord(row)
  if (!record || typeof record.id !== 'string') return null
  if (typeof record.title !== 'string' || record.title.trim() === '') return null
  if (typeof record.description !== 'string') return null
  const price = asNumber(record.price)
  const durationMinutes = asNumber(record.duration_minutes)
  if (price === null || durationMinutes === null) return null
  if (typeof record.is_active !== 'boolean') return null
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    imagePath: asNullableString(record.image_path),
    videoPath: asNullableString(record.video_path),
    price,
    durationMinutes,
    isActive: record.is_active,
  }
}

export function parseBooking(row: unknown): Booking | null {
  const record = asRecord(row)
  if (!record || typeof record.id !== 'string') return null
  if (typeof record.service_id !== 'string') return null
  if (typeof record.preferred_at !== 'string') return null
  const status = asStatus(record.status)
  if (!status) return null
  const related = Array.isArray(record.services) ? record.services[0] : record.services
  const service = asRecord(related)
  return {
    id: record.id,
    serviceId: record.service_id,
    preferredAt: record.preferred_at,
    status,
    notes: asNullableString(record.notes),
    serviceTitle: asNullableString(service?.title),
  }
}

export function publicMediaUrl(
  path: string | null,
  supabaseUrl: string | null | undefined,
): string | null {
  if (!path || !supabaseUrl) return null
  const origin = supabaseUrl.replace(/\/$/, '')
  const encoded = path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')
  return `${origin}/storage/v1/object/public/${SERVICE_MEDIA_BUCKET}/${encoded}`
}
