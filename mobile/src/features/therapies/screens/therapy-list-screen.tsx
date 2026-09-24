import { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { brand } from '@/brand'
import { PressableScale } from '@/components/pressable-scale'
import { THERAPY_GROUPS } from '@/features/therapies/catalog'
import { therapyImage } from '@/features/therapies/art'
import { buildOfferings, type Offering } from '@/features/therapies/offerings'
import { listActiveServices } from '@/features/therapies/api'
import { publicEnv } from '@/lib/env'
import { publicMediaUrl, type Service } from '@/lib/domain'
import { formatDuration } from '@/lib/format'
import { listEnter, THERAPY_TRANSITION, therapyTag } from '@/lib/motion'
import { palette } from '@/theme/unistyles'
import { ms } from '@/lib/scale'

type Section = { id: string; title: string; items: Offering[]; start: number }

function buildSections(services: Service[], query: string): Section[] {
  const needle = query.trim().toLowerCase()
  const offerings = buildOfferings(services).filter((offering) => {
    if (!needle) return true
    const haystack = [
      offering.therapy.name,
      offering.therapy.alsoCalled ?? '',
      offering.therapy.focus,
      offering.therapy.summary,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
  const custom = (offering: Offering) => offering.therapy.slug.startsWith('service-')
  const groups = [
    ...THERAPY_GROUPS.map((group) => ({
      id: group.id,
      title: group.title,
      items: offerings.filter((offering) => offering.therapy.group === group.id && !custom(offering)),
    })),
    { id: 'ojas', title: `From ${brand.name}`, items: offerings.filter(custom) },
  ].filter((group) => group.items.length > 0)

  let start = 0
  return groups.map((group) => {
    const section = { ...group, start }
    start += group.items.length
    return section
  })
}

export function TherapyListScreen() {
  const [services, setServices] = useState<Service[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const insets = useSafeAreaInsets()

  async function load() {
    try {
      const next = await listActiveServices()
      setServices(next)
      setError(null)
    } catch {
      setError('The schedule is offline. You can still read the treatments.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const sections = buildSections(services, query)

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: 16 + insets.top, paddingBottom: 40 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
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
        <View style={styles.header}>
          <Text style={styles.kicker}>{brand.name}</Text>
          <Text style={styles.title}>Treatments</Text>
        </View>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>
            25 Highly Effective Ayurvedic Therapies for Health and Longevity
          </Text>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or focus"
          placeholderTextColor={palette.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.search}
        />
        {error ? <Text style={styles.note}>{error}</Text> : null}
        {sections.map((section) => (
          <View key={section.id} style={styles.group}>
            <View style={styles.groupHeader}>
              <View style={styles.groupDot} />
              <Text style={styles.groupTitle}>{section.title}</Text>
            </View>
            {section.items.map((offering, index) => (
              <TherapyCard
                key={offering.therapy.slug}
                offering={offering}
                index={section.start + index}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

function TherapyCard({ offering, index }: { offering: Offering; index: number }) {
  const { therapy, service } = offering
  const image = therapyImage(
    therapy.slug,
    publicMediaUrl(service?.imagePath ?? null, publicEnv()?.url),
  )
  const entering = listEnter(index)
  const minutes = service?.durationMinutes ?? therapy.typicalMinutes

  return (
    <Animated.View entering={entering}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={therapy.name}
        onPress={() =>
          router.push({ pathname: '/therapy/[slug]', params: { slug: therapy.slug } })
        }
        style={styles.card}
      >
        {image ? (
          <Animated.Image
            source={image}
            resizeMode="cover"
            sharedTransitionTag={therapyTag(therapy.slug)}
            sharedTransitionStyle={THERAPY_TRANSITION}
            style={styles.cardImage}
          />
        ) : null}
        <View style={styles.cardBody}>
          <View style={styles.cardText}>
            <Text style={styles.name}>{therapy.name}</Text>
            <Text style={styles.focus} numberOfLines={1}>
              {therapy.focus}
            </Text>
          </View>
          <Text style={styles.minutes}>{formatDuration(minutes)}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
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
  intro: {
    gap: 8,
    padding: 22,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
  },
  introTitle: {
    fontFamily: theme.fonts.display,
    fontSize: ms(24),
    lineHeight: ms(30),
    color: theme.colors.primaryForeground,
  },
  search: {
    minHeight: 50,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    color: theme.colors.foreground,
  },
  note: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    lineHeight: ms(21),
    color: theme.colors.mutedForeground,
  },
  group: {
    gap: 14,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  groupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  groupTitle: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(13),
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.mutedForeground,
  },
  card: {
    gap: 12,
    padding: 10,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.card,
    boxShadow: `0 6px 20px ${theme.colors.shadow}`,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: theme.fonts.display,
    fontSize: ms(22),
    lineHeight: ms(28),
    color: theme.colors.foreground,
  },
  focus: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    color: theme.colors.mutedForeground,
  },
  minutes: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(13),
    color: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
}))
