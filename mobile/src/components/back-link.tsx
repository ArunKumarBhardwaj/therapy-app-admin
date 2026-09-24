import { Text } from 'react-native'
import { router } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'
import { PressableScale } from '@/components/pressable-scale'
import { ms } from '@/lib/scale'

type BackLinkProps = {
  label?: string
  floating?: boolean
}

export function BackLink({ label = 'Back', floating = false }: BackLinkProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        if (router.canGoBack()) router.back()
        else router.replace('/')
      }}
      style={[styles.button, floating ? styles.floating : null]}
    >
      <Text style={styles.arrow}>←</Text>
      {floating ? null : <Text style={styles.label}>{label}</Text>}
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  floating: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
    justifyContent: 'center',
    borderWidth: 0,
    backgroundColor: 'rgba(255, 252, 247, 0.92)',
    boxShadow: `0 4px 14px ${theme.colors.shadow}`,
  },
  arrow: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(18),
    color: theme.colors.primary,
  },
  label: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(15),
    color: theme.colors.primary,
  },
}))
