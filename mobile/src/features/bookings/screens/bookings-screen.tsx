import { useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { Button } from '@/components/button'
import { PressableScale } from '@/components/pressable-scale'
import { StatTile } from '@/components/stat-tile'
import { AuthPrompt } from '@/features/auth/auth-prompt'
import { useSession } from '@/features/auth/session'
import { cancelBooking, listMyBookings } from '@/features/bookings/api'
import { StatusPill } from '@/features/bookings/status-pill'
import { summarize } from '@/features/bookings/summary'
import { therapyImage } from '@/features/therapies/art'
import { THERAPIES } from '@/features/therapies/catalog'
import { therapyForTitle } from '@/features/therapies/offerings'
import { TherapyStrip } from '@/features/therapies/therapy-strip'
import { formatVisit } from '@/lib/format'
import type { Booking } from '@/lib/domain'
import { EASE_OUT, listEnter, PRESS } from '@/lib/motion'
import { palette } from '@/theme/unistyles'
import { ms } from '@/lib/scale'

type Tab = 'upcoming' | 'past'

export function BookingsScreen() {
  const { status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<Tab>('upcoming')
  const insets = useSafeAreaInsets()

  async function load() {
    if (status !== 'signed-in') return
    try {
      setBookings(await listMyBookings())
      setError(null)
    } catch {
      setError('We could not load your bookings.')
    }
  }

  useFocusEffect(() => {
    void load()
  })

  const summary = summarize(bookings)
  const booked = new Set(
    bookings.map((booking) => therapyForTitle(booking.serviceTitle)?.slug).filter(Boolean),
  )
  const explore = THERAPIES.filter((therapy) => !booked.has(therapy.slug)).slice(0, 8)

  if (status === 'loading') {
    return <View style={styles.screen} />
  }

  if (status !== 'signed-in') {
    return (
      <AuthPrompt
        title="Your bookings"
        body="Sign in to see the times you have requested."
        image={require('../../../../assets/therapy-abhyanga.png')}
      />
    )
  }

  const visible = tab === 'upcoming' ? summary.upcoming : summary.past
  const next = summary.next

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: 16 + insets.top, paddingBottom: 40 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={palette.primary}
            colors={[palette.primary]}
            onRefresh={() => {
              setRefreshing(true)
              void load().finally(() => setRefreshing(false))
            }}
          />
        }
      >
        <Text style={styles.title}>Bookings</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Animated.View entering={listEnter(0)} style={styles.stats}>
          <StatTile value={summary.upcoming.length} label="Upcoming" />
          <StatTile value={summary.pending} label="Pending" />
          <StatTile value={summary.completed} label="Completed" />
        </Animated.View>

        {next ? (
          <Animated.View entering={listEnter(1)}>
            <NextVisit booking={next} />
          </Animated.View>
        ) : null}

        <Animated.View entering={listEnter(2)}>
          <Segmented value={tab} onChange={setTab} />
        </Animated.View>

        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </Text>
            {tab === 'upcoming' ? (
              <Button label="Browse treatments" onPress={() => router.navigate('/')} />
            ) : null}
          </View>
        ) : (
          visible.map((booking, index) => (
            <Animated.View key={booking.id} entering={listEnter(index + 3)}>
              <BookingCard
                booking={booking}
                onCancel={() => {
                  void cancelBooking(booking.id)
                    .then(load)
                    .catch(() => setError('We could not cancel this booking.'))
                }}
              />
            </Animated.View>
          ))
        )}

        <TherapyStrip title="Explore treatments" therapies={explore} />
      </ScrollView>
    </View>
  )
}

function NextVisit({ booking }: { booking: Booking }) {
  const therapy = therapyForTitle(booking.serviceTitle)
  const image = therapy ? therapyImage(therapy.slug, null) : null
  return (
    <View style={styles.next}>
      {image ? <Image source={image} style={styles.nextImage} contentFit="cover" /> : null}
      <View style={styles.nextBody}>
        <Text style={styles.nextKicker}>Next visit</Text>
        <Text style={styles.nextName}>{booking.serviceTitle ?? therapy?.name ?? 'Treatment'}</Text>
        <Text style={styles.nextTime}>{formatVisit(booking.preferredAt)}</Text>
        <StatusPill status={booking.status} />
      </View>
    </View>
  )
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const therapy = therapyForTitle(booking.serviceTitle)
  const image = therapy ? therapyImage(therapy.slug, null) : null
  const content = (
    <>
      {image ? (
        <Image source={image} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={styles.thumb} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={1}>
          {booking.serviceTitle ?? therapy?.name ?? 'Treatment'}
        </Text>
        <Text style={styles.meta}>{formatVisit(booking.preferredAt)}</Text>
        <View style={styles.cardFooter}>
          <StatusPill status={booking.status} />
          {booking.status === 'pending' ? (
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onCancel}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
        {booking.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {booking.notes}
          </Text>
        ) : null}
      </View>
    </>
  )

  if (!therapy) return <View style={styles.card}>{content}</View>
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/therapy/[slug]', params: { slug: therapy.slug } })}
      style={styles.card}
    >
      {content}
    </PressableScale>
  )
}

function Segmented({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  const [width, setWidth] = useState(0)
  const offset = useSharedValue(0)
  const half = Math.max(0, (width - 8) / 2)
  const indicator = useAnimatedStyle(() => ({
    width: half,
    transform: [{ translateX: offset.get() }],
  }))

  function select(tab: Tab) {
    offset.set(withTiming(tab === 'upcoming' ? 0 : half, { ...PRESS, duration: 220, easing: EASE_OUT }))
    onChange(tab)
  }

  return (
    <View
      style={styles.segmented}
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width
        setWidth(next)
        offset.set(value === 'upcoming' ? 0 : (next - 8) / 2)
      }}
    >
      {width > 0 ? <Animated.View style={[styles.indicator, indicator]} /> : null}
      {(['upcoming', 'past'] as const).map((tab) => (
        <Pressable
          key={tab}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === tab }}
          onPress={() => select(tab)}
          style={styles.segment}
        >
          <Text style={[styles.segmentLabel, value === tab ? styles.segmentActive : null]}>
            {tab === 'upcoming' ? 'Upcoming' : 'Past'}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(40),
    lineHeight: ms(46),
    color: theme.colors.foreground,
  },
  error: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    color: theme.colors.destructive,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  next: {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
  },
  nextImage: {
    width: '100%',
    height: 150,
  },
  nextBody: {
    gap: 6,
    padding: 20,
  },
  nextKicker: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(12),
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: theme.colors.primarySoft,
  },
  nextName: {
    fontFamily: theme.fonts.display,
    fontSize: ms(26),
    lineHeight: ms(32),
    color: theme.colors.primaryForeground,
  },
  nextTime: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(15),
    color: theme.colors.primaryForeground,
    marginBottom: 4,
  },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondary,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(14),
    color: theme.colors.mutedForeground,
  },
  segmentActive: {
    color: theme.colors.primary,
  },
  empty: {
    gap: 14,
    alignItems: 'stretch',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    fontFamily: theme.fonts.display,
    fontSize: ms(20),
    textAlign: 'center',
    color: theme.colors.mutedForeground,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.card,
    boxShadow: `0 4px 16px ${theme.colors.shadow}`,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.secondary,
  },
  cardBody: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  name: {
    fontFamily: theme.fonts.display,
    fontSize: ms(19),
    color: theme.colors.foreground,
  },
  meta: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    color: theme.colors.mutedForeground,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cancel: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(14),
    color: theme.colors.destructive,
  },
  notes: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(13),
    lineHeight: ms(18),
    color: theme.colors.mutedForeground,
  },
}))
