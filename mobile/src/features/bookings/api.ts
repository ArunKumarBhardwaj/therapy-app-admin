import { parseBooking, type Booking, type Profile } from '@/lib/domain'
import { getSupabase } from '@/lib/supabase'

const BOOKING_COLUMNS =
  'id, service_id, preferred_at, status, notes, services(title)'

export async function listMyBookings(): Promise<Booking[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_COLUMNS)
    .order('preferred_at', { ascending: false })
  if (error || !data) {
    throw new Error(error?.message ?? 'Could not load bookings.')
  }
  return data.flatMap((row) => {
    const booking = parseBooking(row)
    return booking ? [booking] : []
  })
}

export async function createBooking(input: {
  serviceId: string
  preferredAt: string
  notes: string
  profile: Profile
}): Promise<void> {
  const name = input.profile.fullName?.trim()
  const email = input.profile.email?.trim()
  if (!name || !email) {
    throw new Error('Add your name on the account screen before requesting a treatment.')
  }
  const supabase = await getSupabase()
  const { error } = await supabase.from('bookings').insert({
    user_id: input.profile.id,
    service_id: input.serviceId,
    preferred_at: input.preferredAt,
    status: 'pending',
    user_name: name,
    user_email: email,
    user_phone: input.profile.phone,
    notes: input.notes.trim() || null,
  })
  if (error) throw new Error('We could not save this request.')
}

export async function cancelBooking(id: string): Promise<void> {
  const supabase = await getSupabase()
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('status', 'pending')
  if (error) throw new Error('We could not cancel this booking.')
}
