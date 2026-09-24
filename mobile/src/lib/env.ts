export type PublicSupabaseEnv = {
  url: string
  anonKey: string
}

export function publicEnv(): PublicSupabaseEnv | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null
  return { url, anonKey }
}
