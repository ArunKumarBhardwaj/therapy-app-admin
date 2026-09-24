import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { SystemBars } from 'react-native-edge-to-edge'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { brand } from '@/brand'
import { Button } from '@/components/button'
import { ms } from '@/lib/scale'

export function WelcomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <SystemBars style={{ statusBar: 'light', navigationBar: 'dark' }} />
      <Image
        source={require('../../../../assets/splash.png')}
        style={styles.hero}
        contentFit="cover"
        contentPosition="bottom"
        accessibilityLabel="A linen treatment table in a green room, with a dish of oil by the window."
      />
      <View style={styles.copy}>
        <Text style={styles.mark}>{brand.mark}</Text>
        <Text style={styles.title}>Oil, herbs, and time.</Text>
        <Text style={styles.body}>
          Panchakarma, oil therapies, and local care. Book one treatment.
        </Text>
      </View>
      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        <Button
          label="Create an account"
          tone="secondary"
          onPress={() => router.push('/sign-up')}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    _web: {
      minHeight: '100vh',
    },
  },
  hero: {
    width: '100%',
    flex: 1,
    minHeight: 280,
    backgroundColor: theme.colors.primary,
  },
  copy: {
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  mark: {
    fontFamily: theme.fonts.sansSemibold,
    fontSize: ms(13),
    letterSpacing: 1.4,
    color: theme.colors.primary,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(40),
    lineHeight: ms(44),
    letterSpacing: -0.4,
    color: theme.colors.foreground,
  },
  body: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    lineHeight: ms(24),
    color: theme.colors.mutedForeground,
    maxWidth: 340,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 10,
  },
}))
