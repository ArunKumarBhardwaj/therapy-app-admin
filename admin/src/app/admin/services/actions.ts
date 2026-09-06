'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { SERVICE_MEDIA_BUCKET } from '@/lib/domain'
import { requireAdmin } from '@/lib/session'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ServiceFormState = {
  error: string | null
}

function readFields(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '')
  const price = Number(formData.get('price'))
  const durationMinutes = Number(formData.get('durationMinutes'))
  const isActive = formData.get('isActive') === 'on'
  return { title, description, price, durationMinutes, isActive }
}

function fileFrom(formData: FormData, name: string): File | null {
  const value = formData.get(name)
  if (!(value instanceof File) || value.size === 0) return null
  return value
}

function objectPath(serviceId: string, kind: 'image' | 'video', file: File) {
  const safe = file.name.replace(/[^A-Za-z0-9._-]/g, '_') || kind
  return `${serviceId}/${kind}/${safe}`
}

async function uploadMedia(
  supabase: SupabaseClient,
  serviceId: string,
  kind: 'image' | 'video',
  file: File,
): Promise<{ path: string } | { error: string }> {
  const path = objectPath(serviceId, kind, file)
  const { error } = await supabase.storage
    .from(SERVICE_MEDIA_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined })
  if (error) return { error: error.message }
  return { path }
}

function refreshServicePages() {
  revalidatePath('/')
  revalidatePath('/admin/services')
}

export async function createService(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const auth = await requireAdmin()
  if (!auth) return { error: 'You need admin access to create a service.' }

  const fields = readFields(formData)
  if (!fields.title) return { error: 'Title is required.' }
  if (!Number.isFinite(fields.price) || fields.price < 0) {
    return { error: 'Price must be a number 0 or greater.' }
  }
  if (!Number.isFinite(fields.durationMinutes) || fields.durationMinutes <= 0) {
    return { error: 'Duration must be a number greater than 0.' }
  }

  const id = crypto.randomUUID()
  const thumbnail = fileFrom(formData, 'thumbnail')
  const video = fileFrom(formData, 'video')

  let imagePath: string | null = null
  let videoPath: string | null = null

  if (thumbnail) {
    const uploaded = await uploadMedia(auth.supabase, id, 'image', thumbnail)
    if ('error' in uploaded) return { error: uploaded.error }
    imagePath = uploaded.path
  }

  if (video) {
    const uploaded = await uploadMedia(auth.supabase, id, 'video', video)
    if ('error' in uploaded) return { error: uploaded.error }
    videoPath = uploaded.path
  }

  const { error } = await auth.supabase.from('services').insert({
    id,
    title: fields.title,
    description: fields.description,
    price: fields.price,
    duration_minutes: fields.durationMinutes,
    is_active: fields.isActive,
    image_path: imagePath,
    video_path: videoPath,
  })

  if (error) return { error: error.message }

  refreshServicePages()
  redirect('/admin/services')
}

export async function updateService(
  id: string,
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const auth = await requireAdmin()
  if (!auth) return { error: 'You need admin access to update a service.' }

  const fields = readFields(formData)
  if (!fields.title) return { error: 'Title is required.' }
  if (!Number.isFinite(fields.price) || fields.price < 0) {
    return { error: 'Price must be a number 0 or greater.' }
  }
  if (!Number.isFinite(fields.durationMinutes) || fields.durationMinutes <= 0) {
    return { error: 'Duration must be a number greater than 0.' }
  }

  const thumbnail = fileFrom(formData, 'thumbnail')
  const video = fileFrom(formData, 'video')

  const patch: Record<string, unknown> = {
    title: fields.title,
    description: fields.description,
    price: fields.price,
    duration_minutes: fields.durationMinutes,
    is_active: fields.isActive,
  }

  if (thumbnail) {
    const uploaded = await uploadMedia(auth.supabase, id, 'image', thumbnail)
    if ('error' in uploaded) return { error: uploaded.error }
    patch.image_path = uploaded.path
  }

  if (video) {
    const uploaded = await uploadMedia(auth.supabase, id, 'video', video)
    if ('error' in uploaded) return { error: uploaded.error }
    patch.video_path = uploaded.path
  }

  const { error } = await auth.supabase.from('services').update(patch).eq('id', id)
  if (error) return { error: error.message }

  refreshServicePages()
  revalidatePath(`/admin/services/${id}`)
  redirect('/admin/services')
}

export async function setServiceActive(id: string, isActive: boolean) {
  const auth = await requireAdmin()
  if (!auth) return

  const { error } = await auth.supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return

  refreshServicePages()
}
