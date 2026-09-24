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
import { fail, useFormAction } from '@/lib/form'
import { nextPath } from '@/lib/next-path'
import { isEmail } from '@/lib/text'
import { ms } from '@/lib/scale'

export function SignInScreen() {
  const { signIn } = useSession()
  const params = useLocalSearchParams<{ next?: string }>()
  const next = nextPath(params.next)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, submit, pending] = useFormAction(async () => {
    if (!isEmail(email) || !password) return fail('Enter the email and password for your account.')
    const message = await signIn(email, password)
    if (message) return fail(message)
    if (next) router.replace(next as Href)
    else if (router.canGoBack()) router.back()
    else router.replace('/')
    return null
  })

  return (
    <Screen scroll>
      <BackLink />
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.lead}>Use the email on your Ojas account.</Text>
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
        autoComplete="password"
        secureTextEntry
        autoCapitalize="none"
      />
      <FormMessage result={result} />
      <Button label="Sign in" onPress={submit} pending={pending} />
      <Link href="/forgot-password" style={styles.link}>
        Forgot password
      </Link>
      <Link href={{ pathname: '/sign-up', params: next ? { next } : {} }} style={styles.link}>
        Create an account
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
