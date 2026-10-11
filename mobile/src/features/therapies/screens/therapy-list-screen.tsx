import { useEffect, useState } from 'react'
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { brand } from '@/brand'
import { PressableScale } from '@/components/pressable-scale'
import { refreshServices, useServices } from '@/features/therapies/api'
import { TherapyImage } from '@/features/therapies/therapy-image'
import { therapyGroup, useZoomSource, ZoomViewport } from '@/features/therapies/transition'
import { SERVICE_CATEGORIES, type Service, type ServiceCategory } from '@/lib/domain'
import { formatDuration } from '@/lib/format'
import { EASE_IN_OUT, GRID_ENTER, GRID_EXIT, GRID_LAYOUT, listEnter } from '@/lib/motion'
import { palette } from '@/theme/unistyles'
import { ms } from '@/lib/scale'

type Filter = 'all' | ServiceCategory

const GUTTER = 20
const GAP = 12
// Match theme.radius.lg / theme.radius.sm: the zoom starts from these corners.
const FEATURED_RADIUS = 28
const CARD_IMAGE_RADIUS = 12

function categoryTitle(category: ServiceCategory) {
  return SERVICE_CATEGORIES.find((item) => item.id === category)?.title ?? ''
}

function matchesQuery(service: Service, needle: string) {
  if (!needle) return true
  return [service.title, service.alsoCalled ?? '', service.focus, service.description, ...service.soughtFor]
    .join(' ')
    .toLowerCase()
    .includes(needle)
}

// Rotates once a day so the hero changes without anyone curating it.
function pickFeatured(services: Service[]) {
  if (services.length === 0) return null
  const day = Math.floor(Date.now() / 86_400_000)
  return services[day % services.length]
}

export function TherapyListScreen() {
  const { services, status } = useServices()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [refreshing, setRefreshing] = useState(false)
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()

  const needle = query.trim().toLowerCase()
  const browsing = filter === 'all' && !needle
  const featured = browsing ? pickFeatured(services) : null
  const visible = services.filter(
    (service) =>
      service.id !== featured?.id &&
      (filter === 'all' || service.category === filter) &&
      matchesQuery(service, needle),
  )
  const categories = SERVICE_CATEGORIES.filter((category) =>
    services.some((service) => service.category === category.id),
  )
  const cardWidth = (width - GUTTER * 2 - GAP) / 2
  const loading = services.length === 0 && (status === 'loading' || status === 'idle')

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ZoomViewport>
        <ScrollView
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 + insets.bottom }}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[1]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={palette.primary}
              colors={[palette.primary]}
              onRefresh={() => {
                setRefreshing(true)
                void refreshServices().finally(() => setRefreshing(false))
              }}
            />
          }
        >
          <View style={styles.top}>
            <View style={styles.header}>
              <Text style={styles.kicker}>{brand.name}</Text>
              <Text style={styles.title}>Treatments</Text>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name, focus, or concern"
              placeholderTextColor={palette.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={styles.search}
            />
            {featured ? (
              <Animated.View entering={listEnter(0)}>
                <FeaturedCard service={featured} />
              </Animated.View>
            ) : null}
          </View>

          <View style={styles.chipsBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.title}
                  active={filter === category.id}
                  onPress={() => setFilter(category.id)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.grid}>
            {status === 'error' && services.length === 0 ? (
              <Text style={styles.note}>Treatments could not load. Pull down to try again.</Text>
            ) : loading ? (
              [0, 1, 2, 3].map((key) => <SkeletonCard key={key} width={cardWidth} />)
            ) : visible.length === 0 ? (
              <Text style={styles.note}>No treatment matches that search.</Text>
            ) : (
              visible.map((service, index) => (
                <Animated.View
                  key={service.id}
                  entering={browsing ? listEnter(index + 1) : GRID_ENTER}
                  exiting={GRID_EXIT}
                  layout={GRID_LAYOUT}
                >
                  <GridCard service={service} width={cardWidth} />
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>
      </ZoomViewport>
    </View>
  )
}

function FeaturedCard({ service }: { service: Service }) {
  const zoom = useZoomSource(therapyGroup('featured', service.id), service, {
    radius: FEATURED_RADIUS,
    topOnly: true,
  })
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Featured: ${service.title}`}
      onPress={zoom.open}
      style={({ pressed }) => [styles.featured, pressed ? styles.pressed : null]}
    >
      <Animated.View ref={zoom.ref} collapsable={false} style={[styles.featuredImage, zoom.imageStyle]}>
        <TherapyImage service={service} />
      </Animated.View>
      <View style={styles.featuredBody}>
        <Text style={styles.featuredKicker}>Today's pick · {categoryTitle(service.category)}</Text>
        <Text style={styles.featuredTitle}>{service.title}</Text>
        {service.focus ? (
          <Text style={styles.featuredFocus} numberOfLines={2}>
            {service.focus}
          </Text>
        ) : null}
        <Text style={styles.pill}>{formatDuration(service.durationMinutes)}</Text>
      </View>
    </Pressable>
  )
}

function GridCard({ service, width }: { service: Service; width: number }) {
  const zoom = useZoomSource(therapyGroup('grid', service.id), service, { radius: CARD_IMAGE_RADIUS })
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={service.title}
      onPress={zoom.open}
      style={({ pressed }) => [
        styles.card,
        styles.cardStretch,
        { width },
        pressed ? styles.pressed : null,
      ]}
    >
      <Animated.View
        ref={zoom.ref}
        collapsable={false}
        style={[styles.cardImage, { height: width * 1.15 }, zoom.imageStyle]}
      >
        <TherapyImage service={service} />
      </Animated.View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {service.title}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {categoryTitle(service.category)} · {formatDuration(service.durationMinutes)}
        </Text>
      </View>
    </Pressable>
  )
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      <Text style={[styles.chipLabel, active ? styles.chipLabelActive : null]}>{label}</Text>
    </PressableScale>
  )
}

function SkeletonCard({ width }: { width: number }) {
  const pulse = useSharedValue(0.55)
  useEffect(() => {
    pulse.set(withRepeat(withTiming(1, { duration: 800, easing: EASE_IN_OUT }), -1, true))
  }, [pulse])
  const animated = useAnimatedStyle(() => ({ opacity: pulse.get() }))
  return (
    <Animated.View style={[styles.card, { width }, animated]}>
      <View style={[styles.cardImage, styles.skeleton, { height: width * 1.15 }]} />
      <View style={styles.cardBody}>
        <View style={[styles.skeletonLine, styles.skeleton]} />
        <View style={[styles.skeletonLine, styles.skeleton, { width: '55%' }]} />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  top: {
    paddingHorizontal: GUTTER,
    gap: 16,
    paddingBottom: 4,
  },
  header: {
    gap: 2,
  },
  kicker: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(13),
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: theme.colors.primary,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(40),
    lineHeight: ms(46),
    color: theme.colors.foreground,
  },
  search: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    color: theme.colors.foreground,
  },
  featured: {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
  },
  featuredImage: {
    height: 210,
    overflow: 'hidden',
    backgroundColor: theme.colors.secondary,
  },
  featuredBody: {
    gap: 6,
    padding: 20,
  },
  featuredKicker: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(12),
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.primarySoft,
  },
  featuredTitle: {
    fontFamily: theme.fonts.display,
    fontSize: ms(28),
    lineHeight: ms(34),
    color: theme.colors.primaryForeground,
  },
  featuredFocus: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(15),
    lineHeight: ms(22),
    color: theme.colors.primaryForeground,
    opacity: 0.85,
  },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(13),
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryForeground,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  chipsBar: {
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },
  chips: {
    gap: 8,
    paddingHorizontal: GUTTER,
  },
  chip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipLabel: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(14),
    color: theme.colors.foreground,
  },
  chipLabelActive: {
    color: theme.colors.primaryForeground,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: GUTTER,
    paddingTop: 4,
  },
  note: {
    width: '100%',
    paddingVertical: 24,
    textAlign: 'center',
    fontFamily: theme.fonts.sans,
    fontSize: ms(15),
    lineHeight: ms(22),
    color: theme.colors.mutedForeground,
  },
  card: {
    gap: 8,
    padding: 6,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.card,
    boxShadow: `0 4px 16px ${theme.colors.shadow}`,
  },
  // Dim instead of shrinking: the zoom measures the card on press.
  pressed: {
    opacity: 0.85,
  },
  // Cards in one grid row stretch to the tallest, so a two-line title
  // never leaves its neighbour short.
  cardStretch: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.secondary,
  },
  cardBody: {
    gap: 2,
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  cardTitle: {
    fontFamily: theme.fonts.display,
    fontSize: ms(18),
    lineHeight: ms(23),
    color: theme.colors.foreground,
  },
  cardMeta: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(13),
    color: theme.colors.mutedForeground,
  },
  skeleton: {
    backgroundColor: theme.colors.secondary,
  },
  skeletonLine: {
    height: 12,
    width: '80%',
    borderRadius: 6,
  },
}))
