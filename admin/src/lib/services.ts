import type { SupabaseClient } from '@supabase/supabase-js'
import { parseService, type Service } from '@/lib/domain'

const SERVICE_COLUMNS =
  'id, title, description, image_path, video_path, price, duration_minutes, is_active'

export async function listServices(
  supabase: SupabaseClient,
  options?: { activeOnly?: boolean },
): Promise<Service[]> {
  let query = supabase.from('services').select(SERVICE_COLUMNS).order('title')
  if (options?.activeOnly) {
    query = query.eq('is_active', true)
  }
  const { data, error } = await query
  if (error || !data) return []
  return data.flatMap((row) => {
    const service = parseService(row)
    return service ? [service] : []
  })
}

export async function getService(
  supabase: SupabaseClient,
  id: string,
): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return parseService(data)
}
