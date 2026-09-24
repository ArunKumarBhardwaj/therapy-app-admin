import { useEffect, useState } from 'react'
import { Text } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'
import { BackLink } from '@/components/back-link'
import { Button } from '@/components/button'
import { FormMessage } from '@/components/form-message'
import { Screen } from '@/components/screen'
import { TextField } from '@/components/text-field'
import { AuthPrompt } from '@/features/auth/auth-prompt'
import { useSession } from '@/features/auth/session'
import { createBooking } from '@/features/bookings/api'
import { PreferredAtField } from '@/features/bookings/preferred-at'
import { listActiveServices } from '@/features/therapies/api'
import { findOffering } from '@/features/therapies/offerings'
import { fail, useFormAction, type FormResult } from '@/lib/form'
import { ms } from '@/lib/scale'

function defaultTime() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(10, 0, 0, 0)
  return date
}

export function BookScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { profile, status } = useSession()
  const [title, setTitle] = useState('Request a time')
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [when, setWhen] = useState(defaultTime)
  const [notes, setNotes] = useState('')
  const [closed, setClosed] = useState<FormResult>(null)

  useEffect(() => {
    if (status !== 'signed-in') return
    let alive = true
    async function load() {
      const services = await listActiveServices().catch(() => null)
      if (!alive) return
      if (!services) {
        setClosed(fail('The schedule is offline.'))
        return
      }
      const offering = slug ? findOffering(slug, services) : null
      if (!offering?.service) {
        setClosed(fail('This treatment is not open for booking.'))
        return
      }
      setTitle(offering.therapy.name)
      setServiceId(offering.service.id)
    }
    void load()
    return () => {
      alive = false
    }
  }, [slug, status])

  const [result, submit, pending] = useFormAction(async () => {
    if (!profile || !serviceId) return null
    if (when.getTime() < Date.now() + 60 * 60 * 1000) {
      return fail('Choose a time at least an hour from now.')
    }
    const failure = await createBooking({
      serviceId,
      preferredAt: when.toISOString(),
      notes: notes.trim() ? `${title}\n${notes.trim()}` : title,
      profile,
    }).then(
      () => null,
      (cause: unknown) =>
        fail(cause instanceof Error ? cause.message : 'We could not save this request.'),
    )
    if (failure) return failure
    router.replace('/bookings')
    return null
  })

  if (status === 'loading') {
    return (
      <Screen>
        <Text style={styles.lead}>Loading…</Text>
      </Screen>
    )
  }

  if (status !== 'signed-in') {
    return (
      <AuthPrompt
        title="Sign in to request a time"
        body="You can read every treatment first. An account is only needed when you book."
      />
    )
  }

  return (
    <Screen scroll>
      <BackLink label="Treatment" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.lead}>
        Ojas confirms the time. This request stays pending until then.
      </Text>
      <PreferredAtField value={when} onChange={setWhen} />
      <TextField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Anything the practitioner should know"
      />
      <FormMessage result={result ?? closed} />
      <Button
        label="Send request"
        onPress={submit}
        pending={pending}
        disabled={!serviceId}
      />
    </Screen>
  )
}

const styles = StyleSheet.create((theme) => ({
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(36),
    lineHeight: ms(40),
    color: theme.colors.foreground,
  },
  lead: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    lineHeight: ms(24),
    color: theme.colors.mutedForeground,
  },
}))
