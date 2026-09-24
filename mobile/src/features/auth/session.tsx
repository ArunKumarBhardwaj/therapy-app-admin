import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import * as Linking from 'expo-linking'
import type { Session } from '@supabase/supabase-js'
import { readProfile, saveProfile } from '@/features/account/api'
import { parseAuthLink } from '@/lib/auth-link'
import type { Profile } from '@/lib/domain'
import { publicEnv } from '@/lib/env'
import { initStorage } from '@/lib/storage'
import { getSupabase } from '@/lib/supabase'
import { authMessage } from '@/lib/text'

const RECOVERY_KEY = 'haven.recovery'

type SessionStatus = 'loading' | 'signed-out' | 'signed-in'

type SignUpInput = {
  fullName: string
  email: string
  password: string
}

type SessionValue = {
  status: SessionStatus
  profile: Profile | null
  recovery: boolean
  configError: string | null
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  sendReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  updateProfile: (fullName: string, phone: string) => Promise<string | null>
}

const SessionContext = createContext<SessionValue | null>(null)

async function loadProfile(session: Session): Promise<Profile | null> {
  return readProfile(session.user.id, session.user.email ?? null)
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recovery, setRecovery] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    async function applySession(session: Session | null, recovering: boolean) {
      if (!alive) return
      if (!session) {
        setProfile(null)
        setRecovery(false)
        setStatus('signed-out')
        const store = await initStorage()
        store.remove(RECOVERY_KEY)
        return
      }
      const nextProfile = await loadProfile(session)
      if (!alive) return
      setProfile(nextProfile)
      setRecovery(recovering)
      setStatus('signed-in')
    }

    async function consume(url: string) {
      const link = parseAuthLink(url)
      if (!link.accessToken || !link.refreshToken) return
      const supabase = await getSupabase()
      const { error } = await supabase.auth.setSession({
        access_token: link.accessToken,
        refresh_token: link.refreshToken,
      })
      if (error) return
      const recovering = link.type === 'recovery'
      const store = await initStorage()
      if (recovering) store.setString(RECOVERY_KEY, '1')
      else store.remove(RECOVERY_KEY)
      setRecovery(recovering)
    }

    async function boot() {
      if (!publicEnv()) {
        if (!alive) return
        setConfigError('This build is missing the Supabase keys.')
        setStatus('signed-out')
        return
      }
      const store = await initStorage()
      const supabase = await getSupabase()
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) await consume(initialUrl)
      const { data } = await supabase.auth.getSession()
      const recovering = store.getString(RECOVERY_KEY) === '1' && Boolean(data.session)
      await applySession(data.session, recovering)
      supabase.auth.onAuthStateChange((_event, session) => {
        const stillRecovering = store.getString(RECOVERY_KEY) === '1' && Boolean(session)
        void applySession(session, stillRecovering)
      })
    }

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void consume(url)
    })
    void boot().catch(() => {
      if (!alive) return
      setConfigError('Ojas could not open local storage.')
      setStatus('signed-out')
    })
    return () => {
      alive = false
      subscription.remove()
    }
  }, [])

  const value: SessionValue = {
    status,
    profile,
    recovery,
    configError,
    async signIn(email, password) {
      const supabase = await getSupabase()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      return authMessage(error)
    },
    async signUp(input) {
      const supabase = await getSupabase()
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: { full_name: input.fullName.trim() },
          emailRedirectTo: Linking.createURL('/'),
        },
      })
      if (error || !data.user) {
        return { error: authMessage(error), needsConfirmation: false }
      }
      return { error: null, needsConfirmation: !data.session }
    },
    async signOut() {
      const store = await initStorage()
      store.remove(RECOVERY_KEY)
      setRecovery(false)
      const supabase = await getSupabase()
      await supabase.auth.signOut()
    },
    async sendReset(email) {
      const supabase = await getSupabase()
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: Linking.createURL('reset-password'),
      })
      return error ? 'We could not send the reset email.' : null
    },
    async updatePassword(password) {
      const supabase = await getSupabase()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) return authMessage(error)
      const store = await initStorage()
      store.remove(RECOVERY_KEY)
      setRecovery(false)
      return null
    },
    async updateProfile(fullName, phone) {
      if (!profile) return 'Sign in again to save your account.'
      const failure = await saveProfile({ id: profile.id, fullName, phone }).then(
        () => null,
        (error: unknown) =>
          error instanceof Error ? error.message : 'We could not save your account.',
      )
      if (failure !== null) return failure
      setProfile({
        ...profile,
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      })
      return null
    },
  }

  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSession() {
  const value = use(SessionContext)
  if (!value) throw new Error('useSession must be used inside SessionProvider.')
  return value
}
