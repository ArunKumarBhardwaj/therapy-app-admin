import { parseService, SERVICE_COLUMNS, type Service } from '@/lib/domain'
import { getSupabase } from '@/lib/supabase'

export async function listActiveServices(): Promise<Service[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_COLUMNS)
    .eq('is_active', true)
    .order('title')
  if (error || !data) {
    throw new Error(error?.message ?? 'Could not load therapies.')
  }
  return data.flatMap((row) => {
    const service = parseService(row)
    return service ? [service] : []
  })
}
