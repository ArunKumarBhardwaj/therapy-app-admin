import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces'
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans'
import { SystemBars } from 'react-native-edge-to-edge'
import { palette } from '@/theme/unistyles'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SessionProvider, useSession } from '@/features/auth/session'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <RootGate />
      </SessionProvider>
    </SafeAreaProvider>
  )
}

function RootGate() {
  const { status, recovery } = useSession()
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  })

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palette.background)
  }, [])

  useEffect(() => {
    if (fontsLoaded && status !== 'loading') {
      void SplashScreen.hideAsync()
    }
  }, [fontsLoaded, status])

  if (!fontsLoaded || status === 'loading') return null

  return (
    <>
      <SystemBars style="dark" />
      <Stack
        initialRouteName="(app)"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}
      >
        <Stack.Protected guard={recovery}>
          <Stack.Screen name="reset-password" />
        </Stack.Protected>
        <Stack.Protected guard={!recovery}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  )
}
