import { useState } from 'react'
import { Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Button } from '@/components/button'
import { Screen } from '@/components/screen'
import { FormMessage } from '@/components/form-message'
import { TextField } from '@/components/text-field'
import { useSession } from '@/features/auth/session'
import { fail, useFormAction } from '@/lib/form'
import { passwordIssue } from '@/lib/text'
import { ms } from '@/lib/scale'

export function ResetPasswordScreen() {
  const { updatePassword } = useSession()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [result, submit, pending] = useFormAction(async () => {
    const issue = passwordIssue(password)
    if (issue) return fail(issue)
    if (password !== confirm) return fail('Those passwords do not match.')
    const message = await updatePassword(password)
    return message ? fail(message) : null
  })

  return (
    <Screen scroll>
      <Text style={styles.title}>Choose a new password</Text>
      <Text style={styles.lead}>This replaces the password on your Ojas account.</Text>
      <TextField
        label="New password"
        value={password}
        onChangeText={setPassword}
        autoComplete="new-password"
        secureTextEntry
        autoCapitalize="none"
      />
      <TextField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        autoComplete="new-password"
        secureTextEntry
        autoCapitalize="none"
      />
      <FormMessage result={result} />
      <Button label="Save password" onPress={submit} pending={pending} />
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
