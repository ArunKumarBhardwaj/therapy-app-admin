import { StyleSheet } from 'react-native-unistyles'

export const palette = {
  background: '#f7f1e8',
  foreground: '#2a1c16',
  card: '#fffcf7',
  primary: '#a3432a',
  primaryForeground: '#fff6ec',
  primarySoft: '#e9b9a3',
  accent: '#d9962f',
  secondary: '#f0e3d3',
  mutedForeground: '#7a6558',
  border: '#eadbc8',
  destructive: '#9a2b2b',
  destructiveSoft: '#f6dcd5',
  accentSoft: '#f8e8c9',
  accentForeground: '#7a4e0e',
  success: '#3d6a35',
  successSoft: '#e2ecd8',
  shadow: 'rgba(42, 28, 22, 0.08)',
} as const

const ojas = {
  colors: palette,
  radius: {
    sm: 12,
    md: 18,
    lg: 28,
    pill: 999,
  },
  fonts: {
    sans: 'IBMPlexSans_400Regular',
    sansMedium: 'IBMPlexSans_500Medium',
    sansSemibold: 'IBMPlexSans_600SemiBold',
    display: 'Fraunces_500Medium',
    displaySemibold: 'Fraunces_600SemiBold',
  },
} as const

const breakpoints = {
  xs: 0,
  sm: 360,
  md: 480,
  lg: 768,
} as const

const appThemes = {
  light: ojas,
} as const

type AppThemes = typeof appThemes
type AppBreakpoints = typeof breakpoints

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

const configured = globalThis as { __havenUnistyles?: boolean }

if (!configured.__havenUnistyles) {
  StyleSheet.configure({
    settings: {
      initialTheme: 'light',
    },
    breakpoints,
    themes: appThemes,
  })
  configured.__havenUnistyles = true
}
