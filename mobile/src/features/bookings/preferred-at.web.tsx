import { Text, TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { ms } from '@/lib/scale'

type PreferredAtFieldProps = {
  value: Date
  onChange: (value: Date) => void
}

function toLocalInput(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export function PreferredAtField({ value, onChange }: PreferredAtFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Preferred time</Text>
      <TextInput
        value={toLocalInput(value)}
        onChangeText={(text) => {
          const parsed = new Date(text)
          if (!Number.isNaN(parsed.getTime())) onChange(parsed)
        }}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    gap: 8,
  },
  label: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(14),
    color: theme.colors.foreground,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 14,
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    color: theme.colors.foreground,
  },
}))
