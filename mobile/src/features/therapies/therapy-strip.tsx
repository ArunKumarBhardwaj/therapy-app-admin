import { router } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import { TherapyImage } from '@/features/therapies/therapy-image'
import { therapyGroup, useZoomSource } from '@/features/therapies/transition'
import type { Service } from '@/lib/domain'
import { formatDuration } from '@/lib/format'
import { ms } from '@/lib/scale'

type TherapyStripProps = {
  title: string
  services: Service[]
  /** Unique per screen so two strips never share a transition group. */
  source: string
}

export function TherapyStrip({ title, services, source }: TherapyStripProps) {
  if (services.length === 0) return null
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.navigate('/')}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.bleed}
      >
        {services.map((service) => (
          <StripCard key={service.id} service={service} source={source} />
        ))}
      </ScrollView>
    </View>
  )
}

function StripCard({ service, source }: { service: Service; source: string }) {
  const zoom = useZoomSource(therapyGroup(source, service.id), service, { radius: IMAGE_RADIUS })
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={service.title}
      onPress={zoom.open}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <Animated.View ref={zoom.ref} collapsable={false} style={[styles.image, zoom.imageStyle]}>
        <TherapyImage service={service} />
      </Animated.View>
      <Text style={styles.name} numberOfLines={1}>
        {service.title}
      </Text>
      <Text style={styles.meta}>{formatDuration(service.durationMinutes)}</Text>
    </Pressable>
  )
}

// Matches theme.radius.sm: the zoom starts from these corners.
const IMAGE_RADIUS = 12

const styles = StyleSheet.create((theme) => ({
  pressed: {
    opacity: 0.85,
  },
  wrap: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(22),
    color: theme.colors.foreground,
  },
  link: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(14),
    color: theme.colors.primary,
  },
  bleed: {
    marginHorizontal: -20,
  },
  row: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  card: {
    width: 164,
    gap: 4,
    padding: 8,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.card,
    boxShadow: `0 4px 14px ${theme.colors.shadow}`,
  },
  image: {
    width: '100%',
    height: 112,
    overflow: 'hidden',
    borderRadius: theme.radius.sm,
    marginBottom: 4,
    backgroundColor: theme.colors.secondary,
  },
  name: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(15),
    color: theme.colors.foreground,
    paddingHorizontal: 4,
  },
  meta: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(13),
    color: theme.colors.mutedForeground,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
}))
