'use server'

import { redirect } from 'next/navigation'
import { adminProfile } from '@/lib/domain'
import { readProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'

export type SignInState = {
  error: string | null
}

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  if (!supabase) {
    return { error: 'The site is not connected to a database yet.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !data.user) {
    return { error: 'Those credentials were not accepted.' }
  }

  const session = await readProfile(supabase, data.user.id)
  const profile = adminProfile(session)
  if (!profile) {
    await supabase.auth.signOut()
    return { error: 'This account does not have admin access.' }
  }

  redirect('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect('/')
}
