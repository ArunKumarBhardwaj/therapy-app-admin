import { Stack } from 'expo-router'
import { palette } from '@/theme/unistyles'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }} />
  )
}
