import { Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type { FormResult } from '@/lib/form'
import { ms } from '@/lib/scale'

export function FormMessage({ result }: { result: FormResult }) {
  styles.useVariants({ tone: result?.tone ?? 'error' })
  if (!result) return null
  return <Text style={styles.message}>{result.message}</Text>
}

const styles = StyleSheet.create((theme) => ({
  message: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    lineHeight: ms(21),
    variants: {
      tone: {
        error: { color: theme.colors.destructive },
        notice: { color: theme.colors.success },
      },
    },
  },
}))
