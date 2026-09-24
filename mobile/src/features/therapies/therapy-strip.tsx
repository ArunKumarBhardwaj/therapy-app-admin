import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { PressableScale } from '@/components/pressable-scale'
import { therapyImage } from '@/features/therapies/art'
import type { Therapy } from '@/features/therapies/catalog'
import { formatDuration } from '@/lib/format'
import { ms } from '@/lib/scale'

export function TherapyStrip({ title, therapies }: { title: string; therapies: Therapy[] }) {
  if (therapies.length === 0) return null
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
        {therapies.map((therapy) => (
          <PressableScale
            key={therapy.slug}
            accessibilityRole="button"
            accessibilityLabel={therapy.name}
            onPress={() =>
              router.push({ pathname: '/therapy/[slug]', params: { slug: therapy.slug } })
            }
            style={styles.card}
          >
            <Image
              source={therapyImage(therapy.slug, null)}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
            <Text style={styles.name} numberOfLines={1}>
              {therapy.name}
            </Text>
            <Text style={styles.meta}>{formatDuration(therapy.typicalMinutes)}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
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
