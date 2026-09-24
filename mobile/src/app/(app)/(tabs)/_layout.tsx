import type { ColorValue } from 'react-native'
import { Tabs } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import type { AndroidSymbol } from 'expo-symbols'
import type { SFSymbol } from 'sf-symbols-typescript'
import { palette } from '@/theme/unistyles'
import { ms } from '@/lib/scale'

function TabIcon({
  color,
  size,
  ios,
  android,
}: {
  color: ColorValue
  size: number
  ios: SFSymbol
  android: AndroidSymbol
}) {
  return (
    <SymbolView
      name={{ ios, android, web: android }}
      tintColor={color}
      size={size}
    />
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.mutedForeground,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
        },
        tabBarLabelStyle: {
          fontFamily: 'IBMPlexSans_500Medium',
          fontSize: ms(12),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Treatments',
          tabBarIcon: ({ color, size }) => (
            <TabIcon color={color} size={size} ios="leaf" android="local_florist" />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon color={color} size={size} ios="calendar" android="calendar_month" />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <TabIcon color={color} size={size} ios="person" android="person" />
          ),
        }}
      />
    </Tabs>
  )
}
