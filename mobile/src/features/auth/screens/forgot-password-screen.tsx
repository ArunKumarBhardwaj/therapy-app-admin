import { useState } from 'react'
import { Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { BackLink } from '@/components/back-link'
import { Button } from '@/components/button'
import { Screen } from '@/components/screen'
import { FormMessage } from '@/components/form-message'
import { TextField } from '@/components/text-field'
import { useSession } from '@/features/auth/session'
import { fail, notice, useFormAction } from '@/lib/form'
import { isEmail } from '@/lib/text'
import { ms } from '@/lib/scale'

export function ForgotPasswordScreen() {
  const { sendReset } = useSession()
  const [email, setEmail] = useState('')
  const [result, submit, pending] = useFormAction(async () => {
    if (!isEmail(email)) return fail('Enter the email on the account.')
    const message = await sendReset(email)
    if (message) return fail(message)
    return notice('If an account exists for that email, the reset link is on its way.')
  })

  return (
    <Screen scroll>
      <BackLink />
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.lead}>
        We will email a link that opens Ojas and lets you choose a new password.
      </Text>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoComplete="email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormMessage result={result} />
      <Button label="Send reset link" onPress={submit} pending={pending} />
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
