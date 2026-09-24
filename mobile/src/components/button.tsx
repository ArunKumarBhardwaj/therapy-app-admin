import { Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { PressableScale } from '@/components/pressable-scale'
import { ms } from '@/lib/scale'

type Tone = 'primary' | 'secondary' | 'inverse' | 'ghost'

type ButtonProps = {
  label: string
  onPress: () => void
  tone?: Tone
  disabled?: boolean
  pending?: boolean
}

export function Button({
  label,
  onPress,
  tone = 'primary',
  disabled = false,
  pending = false,
}: ButtonProps) {
  styles.useVariants({ tone })
  const inactive = disabled || pending

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: pending }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.button, inactive ? styles.inactive : null]}
    >
      <Text style={styles.label}>{pending ? 'Please wait…' : label}</Text>
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: theme.radius.pill,
    borderCurve: 'continuous',
    variants: {
      tone: {
        primary: { backgroundColor: theme.colors.primary },
        secondary: { backgroundColor: theme.colors.secondary },
        inverse: { backgroundColor: theme.colors.primaryForeground },
        ghost: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primarySoft,
        },
      },
    },
  },
  label: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(16),
    letterSpacing: 0.2,
    variants: {
      tone: {
        primary: { color: theme.colors.primaryForeground },
        secondary: { color: theme.colors.foreground },
        inverse: { color: theme.colors.primary },
        ghost: { color: theme.colors.primaryForeground },
      },
    },
  },
  inactive: {
    opacity: 0.5,
  },
}))
