import { useEffect, useSyncExternalStore } from 'react'
import { parseService, publicMediaUrl, SERVICE_COLUMNS, type Service } from '@/lib/domain'
import { publicEnv } from '@/lib/env'
import { getSupabase } from '@/lib/supabase'

export async function listActiveServices(): Promise<Service[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_COLUMNS)
    .eq('is_active', true)
    .order('sort_order')
    .order('title')
  if (error || !data) {
    throw new Error(error?.message ?? 'Could not load therapies.')
  }
  return data.flatMap((row) => {
    const service = parseService(row)
    return service ? [service] : []
  })
}

type ServicesState = {
  services: Service[]
  status: 'idle' | 'loading' | 'ready' | 'error'
}

let state: ServicesState = { services: [], status: 'idle' }
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

function setState(next: ServicesState) {
  state = next
  listeners.forEach((listener) => listener())
}

export function refreshServices(): Promise<void> {
  if (inflight) return inflight
  if (state.status !== 'ready') setState({ ...state, status: 'loading' })
  inflight = listActiveServices()
    .then(
      (services) => setState({ services, status: 'ready' }),
      () => setState({ ...state, status: state.status === 'ready' ? 'ready' : 'error' }),
    )
    .finally(() => {
      inflight = null
    })
  return inflight
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useServices() {
  const current = useSyncExternalStore(subscribe, () => state)
  useEffect(() => {
    if (state.status === 'idle') void refreshServices()
  }, [])
  return current
}

export function useService(id: string | undefined) {
  const { services, status } = useServices()
  const service = id ? (services.find((item) => item.id === id) ?? null) : null
  return { service, status }
}

export function mediaUrl(path: string | null) {
  return publicMediaUrl(path, publicEnv()?.url)
}
