import { useState } from 'react'
import { Text } from 'react-native'
import { Link, router, useLocalSearchParams, type Href } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'
import { BackLink } from '@/components/back-link'
import { Button } from '@/components/button'
import { Screen } from '@/components/screen'
import { FormMessage } from '@/components/form-message'
import { TextField } from '@/components/text-field'
import { useSession } from '@/features/auth/session'
import { fail, notice, useFormAction } from '@/lib/form'
import { nextPath } from '@/lib/next-path'
import { isEmail, passwordIssue } from '@/lib/text'
import { ms } from '@/lib/scale'

export function SignUpScreen() {
  const { signUp } = useSession()
  const params = useLocalSearchParams<{ next?: string }>()
  const next = nextPath(params.next)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, submit, pending] = useFormAction(async () => {
    const passwordError = passwordIssue(password)
    if (fullName.trim().length < 2) return fail('Tell us the name you want on the booking.')
    if (!isEmail(email)) return fail('Enter a real email. We use it to confirm the visit.')
    if (passwordError) return fail(passwordError)
    const outcome = await signUp({ fullName, email, password })
    if (outcome.error) return fail(outcome.error)
    if (outcome.needsConfirmation) {
      return notice('Check your email to confirm the account, then sign in.')
    }
    if (next) router.replace(next as Href)
    else if (router.canGoBack()) router.back()
    else router.replace('/')
    return null
  })

  return (
    <Screen scroll>
      <BackLink />
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.lead}>One account for your treatments and bookings.</Text>
      <TextField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        autoComplete="name"
        autoCapitalize="words"
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoComplete="email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        autoComplete="new-password"
        secureTextEntry
        autoCapitalize="none"
      />
      <FormMessage result={result} />
      <Button label="Create account" onPress={submit} pending={pending} />
      <Link href={{ pathname: '/sign-in', params: next ? { next } : {} }} style={styles.link}>
        Sign in
      </Link>
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
  link: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(15),
    color: theme.colors.primary,
  },
}))
