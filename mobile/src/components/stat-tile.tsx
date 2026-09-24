import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { ms } from '@/lib/scale'

export function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  tile: {
    flex: 1,
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.card,
    boxShadow: `0 4px 16px ${theme.colors.shadow}`,
  },
  value: {
    fontFamily: theme.fonts.displaySemibold,
    fontSize: ms(28),
    lineHeight: ms(34),
    color: theme.colors.primary,
  },
  label: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(13),
    color: theme.colors.mutedForeground,
  },
}))
