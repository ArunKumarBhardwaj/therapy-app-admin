import type { SupabaseClient } from '@supabase/supabase-js'
import { parseProfile, type Profile } from '@/lib/domain'

export const PROFILE_COLUMNS = 'id, full_name, phone, role, created_at'

export async function listProfiles(supabase: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.flatMap((row) => {
    const profile = parseProfile(row)
    return profile ? [profile] : []
  })
}