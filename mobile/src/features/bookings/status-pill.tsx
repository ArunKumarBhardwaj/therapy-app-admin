import { Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import type { BookingStatus } from '@/lib/domain'
import { formatStatus } from '@/lib/format'
import { ms } from '@/lib/scale'

export function StatusPill({ status }: { status: BookingStatus }) {
  styles.useVariants({ status })
  return <Text style={styles.pill}>{formatStatus(status)}</Text>
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(12),
    letterSpacing: 0.3,
    variants: {
      status: {
        pending: { backgroundColor: theme.colors.accentSoft, color: theme.colors.accentForeground },
        confirmed: { backgroundColor: theme.colors.successSoft, color: theme.colors.success },
        completed: { backgroundColor: theme.colors.secondary, color: theme.colors.mutedForeground },
        cancelled: { backgroundColor: theme.colors.destructiveSoft, color: theme.colors.destructive },
      },
    },
  },
}))
