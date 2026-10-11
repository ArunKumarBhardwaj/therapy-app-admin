import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { BackLink } from '@/components/back-link'
import { useService } from '@/features/therapies/api'
import {
  HERO_HEIGHT,
  RequestFooter,
  TherapySheet,
} from '@/features/therapies/therapy-detail-content'
import { TherapyImage } from '@/features/therapies/therapy-image'
import { ms } from '@/lib/scale'

// The route a deep link lands on. Taps inside the app open the zoom overlay instead.
export function TherapyDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { service, status } = useService(id)
  const missing = !service && (status === 'ready' || status === 'error')

  return (
    <View style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>{service ? <TherapyImage service={service} /> : null}</View>
        {service ? (
          <TherapySheet service={service} />
        ) : (
          <Text style={styles.note}>{missing ? 'This treatment is not listed.' : 'Loading…'}</Text>
        )}
      </ScrollView>
      <View style={[styles.back, { top: insets.top + 8 }]}>
        <BackLink label="Back to treatments" floating />
      </View>
      {service ? <RequestFooter service={service} bottomInset={insets.bottom} /> : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: theme.colors.secondary,
  },
  back: {
    position: 'absolute',
    left: 16,
  },
  note: {
    padding: 24,
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    color: theme.colors.mutedForeground,
  },
}))
