import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Constants from 'expo-constants'
import { router, useFocusEffect } from 'expo-router'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { brand } from '@/brand'
import { Button } from '@/components/button'
import { FormMessage } from '@/components/form-message'
import { StatTile } from '@/components/stat-tile'
import { TextField } from '@/components/text-field'
import { AuthPrompt } from '@/features/auth/auth-prompt'
import { useSession } from '@/features/auth/session'
import { listMyBookings } from '@/features/bookings/api'
import { summarize } from '@/features/bookings/summary'
import { THERAPIES, type Therapy } from '@/features/therapies/catalog'
import { therapyForTitle } from '@/features/therapies/offerings'
import { TherapyStrip } from '@/features/therapies/therapy-strip'
import type { Booking } from '@/lib/domain'
import { fail, notice, useFormAction } from '@/lib/form'
import { listEnter } from '@/lib/motion'
import { ms } from '@/lib/scale'

function initials(name: string | null, email: string | null) {
  const source = name?.trim() || email?.split('@')[0] || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2)
  return letters.toUpperCase()
}

export function AccountScreen() {
  const { status, profile, updateProfile, signOut, sendReset } = useSession()
  const insets = useSafeAreaInsets()
  const [fullName, setFullName] = useState(profile?.fullName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [bookings, setBookings] = useState<Booking[]>([])
  useFocusEffect(() => {
    if (status !== 'signed-in') return
    void listMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
  })

  const summary = summarize(bookings)
  const yours = new Map<string, Therapy>()
  for (const booking of bookings) {
    const therapy = therapyForTitle(booking.serviceTitle)
    if (therapy) yours.set(therapy.slug, therapy)
  }

  const [saved, save, saving] = useFormAction(async () => {
    if (fullName.trim().length < 2) return fail('Keep the name you want on the booking.')
    const message = await updateProfile(fullName, phone)
    return message ? fail(message) : notice('Saved.')
  })

  const [reset, resetPassword] = useFormAction(async () => {
    if (!profile?.email) return null
    const message = await sendReset(profile.email)
    return message ? fail(message) : notice(`We sent a reset link to ${profile.email}.`)
  })

  if (status === 'loading') {
    return <View style={styles.screen} />
  }

  if (status !== 'signed-in') {
    return (
      <AuthPrompt
        title="Your account"
        body="Sign in to keep your name and phone on a booking."
        image={require('../../../../assets/therapy-shirovasthi.png')}
      />
    )
  }

  const version = Constants.expoConfig?.version ?? '1.0.0'

  return (
    <View style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: 16 + insets.top, paddingBottom: 40 + insets.bottom },
        ]}
      >
        <Text style={styles.title}>Account</Text>

        <Animated.View entering={listEnter(0)} style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(profile?.fullName ?? null, profile?.email ?? null)}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile?.fullName ?? 'Add your name'}
            </Text>
            <Text style={styles.profileMeta} numberOfLines={1}>
              {profile?.email ?? 'Signed in'}
            </Text>
            {profile?.phone ? <Text style={styles.profileMeta}>{profile.phone}</Text> : null}
          </View>
        </Animated.View>

        <Animated.View entering={listEnter(1)} style={styles.stats}>
          <StatTile value={summary.total} label="Bookings" />
          <StatTile value={summary.upcoming.length} label="Upcoming" />
          <StatTile value={summary.completed} label="Completed" />
        </Animated.View>

        <Animated.View entering={listEnter(2)} style={styles.section}>
          <Text style={styles.sectionTitle}>Your details</Text>
          <TextField
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            autoCapitalize="words"
          />
          <TextField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            autoComplete="tel"
            keyboardType="phone-pad"
          />
          <FormMessage result={saved} />
          <Button label="Save" onPress={save} pending={saving} />
        </Animated.View>

        <TherapyStrip
          title={yours.size > 0 ? 'Your treatments' : 'Explore treatments'}
          therapies={yours.size > 0 ? [...yours.values()] : THERAPIES.slice(8, 16)}
        />

        <Animated.View entering={listEnter(3)} style={styles.menu}>
          <MenuRow label="My bookings" onPress={() => router.navigate('/bookings')} />
          <MenuRow label="Browse treatments" onPress={() => router.navigate('/')} />
          <MenuRow label="Change password" onPress={resetPassword} />
          <MenuRow label="Sign out" tone="danger" last onPress={() => void signOut()} />
        </Animated.View>
        <FormMessage result={reset} />

        <Text style={styles.version}>
          {brand.name} · Version {version}
        </Text>
      </ScrollView>
    </View>
  )
}

function MenuRow({
  label,
  onPress,
  tone = 'default',
  last = false,
}: {
  label: string
  onPress: () => void
  tone?: 'default' | 'danger'
  last?: boolean
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, last ? null : styles.rowDivider, pressed ? styles.rowPressed : null]}
    >
      <Text style={[styles.rowLabel, tone === 'danger' ? styles.rowDanger : null]}>{label}</Text>
      {tone === 'danger' ? null : <Text style={styles.chevron}>›</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 18,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: ms(40),
    lineHeight: ms(46),
    color: theme.colors.foreground,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryForeground,
  },
  avatarText: {
    fontFamily: theme.fonts.displaySemibold,
    fontSize: ms(24),
    color: theme.colors.primary,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: theme.fonts.display,
    fontSize: ms(24),
    lineHeight: ms(30),
    color: theme.colors.primaryForeground,
  },
  profileMeta: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(14),
    color: theme.colors.primarySoft,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    gap: 14,
    padding: 18,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.card,
    boxShadow: `0 4px 16px ${theme.colors.shadow}`,
  },
  sectionTitle: {
    fontFamily: theme.fonts.display,
    fontSize: ms(22),
    color: theme.colors.foreground,
  },
  menu: {
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.card,
    boxShadow: `0 4px 16px ${theme.colors.shadow}`,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowPressed: {
    backgroundColor: theme.colors.secondary,
  },
  rowLabel: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: ms(16),
    color: theme.colors.foreground,
  },
  rowDanger: {
    color: theme.colors.destructive,
  },
  chevron: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(24),
    color: theme.colors.mutedForeground,
  },
  version: {
    fontFamily: theme.fonts.sans,
    fontSize: ms(13),
    textAlign: 'center',
    color: theme.colors.mutedForeground,
  },
}))
