import { Text } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'
import { Button } from '@/components/button'
import { Screen } from '@/components/screen'
import { ms } from '@/lib/scale'

type AuthPromptProps = {
  title: string
  body: string
  image?: number
}

export function AuthPrompt({ title, body, image }: AuthPromptProps) {
  return (
    <Screen
      footer={
        <>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
          <Button
            label="Create an account"
            tone="secondary"
            onPress={() => router.push('/sign-up')}
          />
        </>
      }
    >
      {image ? <Image source={image} style={styles.image} contentFit="cover" /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </Screen>
  )
}

const styles = StyleSheet.create((theme) => ({
  image: {
    width: '100%',
    height: 280,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.secondary,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(36),
    lineHeight: ms(42),
    color: theme.colors.foreground,
  },
  body: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(16),
    lineHeight: ms(24),
    color: theme.colors.mutedForeground,
  },
}))
