import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { BackLink } from '@/components/back-link'
import { Button } from '@/components/button'
import { useSession } from '@/features/auth/session'
import { therapyImage } from '@/features/therapies/art'
import { listActiveServices } from '@/features/therapies/api'
import { findOffering, type Offering } from '@/features/therapies/offerings'
import { formatDuration, formatPrice } from '@/lib/format'
import { publicEnv } from '@/lib/env'
import { publicMediaUrl, type Service } from '@/lib/domain'
import { DETAIL_ENTER, THERAPY_TRANSITION, therapyTag } from '@/lib/motion'
import { ms } from '@/lib/scale'

const HERO_HEIGHT = 400

export function TherapyDetailScreen() {
  const { slug = '' } = useLocalSearchParams<{ slug: string }>()
  const { status } = useSession()
  const insets = useSafeAreaInsets()
  const [offering, setOffering] = useState<Offering | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      let services: Service[] = []
      try {
        services = await listActiveServices()
      } catch {
        services = []
      }
      if (!alive) return
      const next = slug ? findOffering(slug, services) : null
      setOffering(next)
      setMissing(!next)
    }
    void load()
    return () => {
      alive = false
    }
  }, [slug])

  const env = publicEnv()
  const service = offering?.service ?? null
  const image = therapyImage(slug, publicMediaUrl(service?.imagePath ?? null, env?.url))
  const videoUrl = publicMediaUrl(service?.videoPath ?? null, env?.url)

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {image ? (
            <Animated.Image
              source={image}
              resizeMode="cover"
              sharedTransitionTag={therapyTag(slug)}
              sharedTransitionStyle={THERAPY_TRANSITION}
              style={styles.heroImage}
            />
          ) : null}
        </View>
        <View style={styles.sheet}>
          {missing ? (
            <Text style={styles.title}>This treatment is not listed.</Text>
          ) : offering ? (
            <Animated.View entering={DETAIL_ENTER} style={styles.sheetBody}>
              <Text style={styles.kicker}>{offering.therapy.focus}</Text>
              <Text style={styles.title}>{offering.therapy.name}</Text>
              {offering.therapy.alsoCalled ? (
                <Text style={styles.also}>Also called {offering.therapy.alsoCalled}</Text>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {formatDuration(service?.durationMinutes ?? offering.therapy.typicalMinutes)}
                </Text>
                {service ? <Text style={styles.meta}>{formatPrice(service.price)}</Text> : null}
              </View>
              <Text style={styles.lead}>{service?.description || offering.therapy.summary}</Text>
              {offering.therapy.soughtFor.length > 0 ? (
                <View style={styles.tags}>
                  {offering.therapy.soughtFor.map((item) => (
                    <Text key={item} style={styles.tag}>
                      {item}
                    </Text>
                  ))}
                </View>
              ) : null}
              {videoUrl ? <TherapyVideo uri={videoUrl} /> : null}
            </Animated.View>
          ) : (
            <Text style={styles.also}>Loading…</Text>
          )}
        </View>
      </ScrollView>
      <View style={[styles.back, { top: insets.top + 8 }]}>
        <BackLink label="Back to treatments" floating />
      </View>
      {offering ? (
        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          {service ? (
            <Button
              label="Request a time"
              onPress={() => {
                if (status !== 'signed-in') {
                  router.push({ pathname: '/sign-in', params: { next: `/book/${slug}` } })
                  return
                }
                router.push({ pathname: '/book/[slug]', params: { slug } })
              }}
            />
          ) : (
            <Text style={styles.closed}>
              This treatment is not open for booking until Ojas publishes it.
            </Text>
          )}
        </View>
      ) : null}
    </View>
  )
}

function TherapyVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false
  })
  return <VideoView player={player} style={styles.video} nativeControls contentFit="cover" />
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
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  sheet: {
    marginTop: -28,
    minHeight: 240,
    paddingHorizontal: 24,
    paddingTop: 28,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    backgroundColor: theme.colors.background,
  },
  sheetBody: {
    gap: 14,
  },
  back: {
    position: 'absolute',
    left: 16,
  },
  kicker: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(13),
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.primary,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(36),
    lineHeight: ms(42),
    color: theme.colors.foreground,
  },
  also: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(15),
    color: theme.colors.mutedForeground,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  meta: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(14),
    color: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  lead: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    lineHeight: ms(25),
    color: theme.colors.foreground,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    color: theme.colors.foreground,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 220,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.foreground,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  closed: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    lineHeight: ms(21),
    color: theme.colors.mutedForeground,
  },
}))
