import { cache } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { adminProfile, parseProfile, type SessionState } from '@/lib/domain'
import { PROFILE_COLUMNS } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'

export async function readProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<SessionState> {
  const { data: row } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  const profile = parseProfile(row)
  if (!profile) return { status: 'anonymous' }
  return { status: 'signed-in', profile }
}

export async function readSession(supabase: SupabaseClient): Promise<SessionState> {
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims.sub
  if (typeof userId !== 'string' || userId.length === 0) {
    return { status: 'anonymous' }
  }

  return readProfile(supabase, userId)
}

export const getSession = cache(async function getSession(): Promise<SessionState> {
  const supabase = await createClient()
  if (!supabase) return { status: 'anonymous' }
  return readSession(supabase)
})

export const requireAdmin = cache(async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const session = await getSession()
  const profile = adminProfile(session)
  if (!profile) return null
  return { supabase, profile }
})
