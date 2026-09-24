import { parseProfile, type Profile } from '@/lib/domain'
import { getSupabase } from '@/lib/supabase'

export async function readProfile(
  userId: string,
  email: string | null,
): Promise<Profile | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return parseProfile(data, email)
}

export async function saveProfile(input: {
  id: string
  fullName: string
  phone: string
}): Promise<void> {
  const supabase = await getSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName.trim(),
      phone: input.phone.trim() || null,
    })
    .eq('id', input.id)
  if (error) throw new Error('We could not save your account.')
}
