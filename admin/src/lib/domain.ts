export type Role = 'user' | 'admin'

export type Profile = {
  id: string
  fullName: string | null
  email: string | null
  phone: string | null
  role: Role
  createdAt: string | null
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

export type SessionState =
  | { status: 'anonymous' }
  | { status: 'signed-in'; profile: Profile }

export const SERVICE_MEDIA_BUCKET = 'service-media'

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

export function parseProfile(row: unknown): Profile | null {
  const record = asRecord(row)
  if (!record || typeof record.id !== 'string') return null
  const role = asRole(record.role)
  if (!role) return null
  return {
    id: record.id,
    fullName: asNullableString(record.full_name),
    email: asNullableString(record.email),
    phone: asNullableString(record.phone),
    role,
    createdAt: asNullableString(record.created_at),
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

export function adminProfile(session: SessionState): Profile | null {
  if (session.status !== 'signed-in') return null
  if (session.profile.role !== 'admin') return null
  return session.profile
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
