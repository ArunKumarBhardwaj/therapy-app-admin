import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  tone?: 'paper' | 'pine'
  footer?: ReactNode
  edges?: Array<'top' | 'bottom'>
}

export function Screen({
  children,
  scroll = false,
  tone = 'paper',
  footer,
  edges = ['top', 'bottom'],
}: ScreenProps) {
  styles.useVariants({ tone })
  const insets = useSafeAreaInsets()
  const padTop = edges.includes('top') ? insets.top : 0
  const padBottom = edges.includes('bottom') ? insets.bottom : 0

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: 20 + padTop, paddingBottom: footer ? 28 : 28 + padBottom },
      ]}
      keyboardShouldPersistTaps="handled"
      style={styles.flex}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        styles.content,
        { paddingTop: 20 + padTop, paddingBottom: footer ? 28 : 28 + padBottom },
      ]}
    >
      {children}
    </View>
  )

  return (
    <View style={styles.screen}>
      {body}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: 12 + padBottom }]}>{footer}</View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    _web: {
      minHeight: '100vh',
    },
    variants: {
      tone: {
        paper: { backgroundColor: theme.colors.background },
        pine: { backgroundColor: theme.colors.primary },
      },
    },
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 16,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 10,
  },
}))
