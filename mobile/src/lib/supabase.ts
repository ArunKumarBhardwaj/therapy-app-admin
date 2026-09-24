import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/env'
import { initStorage, type AppStore } from '@/lib/storage'

let client: SupabaseClient | null = null
let opening: Promise<SupabaseClient> | null = null

function adapter(store: AppStore) {
  return {
    getItem: (key: string) => store.getString(key),
    setItem: (key: string, value: string) => {
      store.setString(key, value)
    },
    removeItem: (key: string) => {
      store.remove(key)
    },
  }
}

async function open(): Promise<SupabaseClient> {
  const env = publicEnv()
  if (!env) {
    throw new Error('Supabase is not configured.')
  }
  const store = await initStorage()
  return createClient(env.url, env.anonKey, {
    auth: {
      storage: adapter(store),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
}

export function getSupabase(): Promise<SupabaseClient> {
  if (client) return Promise.resolve(client)
  if (!opening) {
    opening = open()
      .then((ready) => {
        client = ready
        return ready
      })
      .catch((error: unknown) => {
        opening = null
        throw error
      })
  }
  return opening
}
