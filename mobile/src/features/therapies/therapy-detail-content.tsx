import { Text, View } from 'react-native'
import { router } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import { StyleSheet } from 'react-native-unistyles'
import { Button } from '@/components/button'
import { useSession } from '@/features/auth/session'
import { mediaUrl } from '@/features/therapies/api'
import type { Service } from '@/lib/domain'
import { formatDuration, formatPrice } from '@/lib/format'
import { ms } from '@/lib/scale'

export const HERO_HEIGHT = 400

/** Everything under the hero image. Shared by the detail route and the zoom overlay. */
export function TherapySheet({ service }: { service: Service }) {
  const videoUrl = mediaUrl(service.videoPath)
  return (
    <View style={styles.sheet}>
      {service.focus ? <Text style={styles.kicker}>{service.focus}</Text> : null}
      <Text style={styles.title}>{service.title}</Text>
      {service.alsoCalled ? <Text style={styles.also}>Also called {service.alsoCalled}</Text> : null}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatDuration(service.durationMinutes)}</Text>
        <Text style={styles.meta}>{formatPrice(service.price)}</Text>
      </View>
      {service.description ? <Text style={styles.lead}>{service.description}</Text> : null}
      {service.soughtFor.length > 0 ? (
        <View style={styles.tags}>
          {service.soughtFor.map((item) => (
            <Text key={item} style={styles.tag}>
              {item}
            </Text>
          ))}
        </View>
      ) : null}
      {videoUrl ? <TherapyVideo uri={videoUrl} /> : null}
    </View>
  )
}

export function RequestFooter({ service, bottomInset }: { service: Service; bottomInset: number }) {
  const { status } = useSession()
  return (
    <View style={[styles.footer, { paddingBottom: 12 + bottomInset }]}>
      <Button
        label="Request a time"
        onPress={() => {
          if (status !== 'signed-in') {
            router.push({ pathname: '/sign-in', params: { next: `/book/${service.id}` } })
            return
          }
          router.push({ pathname: '/book/[id]', params: { id: service.id } })
        }}
      />
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
  sheet: {
    gap: 14,
    minHeight: 240,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: theme.colors.background,
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
}))
