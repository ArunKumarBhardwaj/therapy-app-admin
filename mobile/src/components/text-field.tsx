import { Text, TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { palette } from '@/theme/unistyles'
import { ms } from '@/lib/scale'

type TextFieldProps = {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  error?: string | null
  secureTextEntry?: boolean
  autoComplete?: 'email' | 'password' | 'name' | 'tel' | 'off' | 'new-password'
  keyboardType?: 'default' | 'email-address' | 'phone-pad'
  autoCapitalize?: 'none' | 'words' | 'sentences'
  multiline?: boolean
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  autoComplete = 'off',
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
}: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.mutedForeground}
        secureTextEntry={secureTextEntry}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoComplete !== 'email' && autoComplete !== 'password'}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline ? styles.multiline : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 14,
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    color: theme.colors.foreground,
  },
  multiline: {
    minHeight: 120,
    paddingTop: 14,
  },
  error: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(13),
    color: theme.colors.destructive,
  },
}))
