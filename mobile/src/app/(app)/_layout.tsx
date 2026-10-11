import { Stack } from 'expo-router'
import { palette } from '@/theme/unistyles'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="therapy/[id]" />
      <Stack.Screen name="book/[id]" />
    </Stack>
  )
}
