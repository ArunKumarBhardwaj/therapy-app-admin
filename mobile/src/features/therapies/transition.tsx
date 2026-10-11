import { createContext, use, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { BackHandler, Keyboard, StyleSheet as RNStyleSheet, View } from 'react-native'
import { useIsFocused } from 'expo-router'
import Animated, {
  Easing,
  interpolate,
  makeMutable,
  ReduceMotion,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'
import { StyleSheet } from 'react-native-unistyles'
import { BackLink } from '@/components/back-link'
import {
  HERO_HEIGHT,
  RequestFooter,
  TherapySheet,
} from '@/features/therapies/therapy-detail-content'
import { TherapyImage } from '@/features/therapies/therapy-image'
import type { Service } from '@/lib/domain'

/*
 * Card-to-detail zoom, built without a transition library.
 *
 * The detail opens in an overlay above the tabs instead of a new route, so nothing
 * mounts or navigates while the animation runs. A single progress value on the UI
 * thread moves the image from the measured card frame into the hero, fades the
 * page in behind it and lifts the text once the image has nearly landed.
 */

type Rect = { x: number; y: number; width: number; height: number }

type Zoom = {
  service: Service
  bound: string
  from: Rect
  // The visible part of the screen the card was in. The flying image starts
  // clipped to it, so a card half under the tab bar never pops over the tab bar.
  clip: Rect
  // The overlay's own size, which the clip grows to.
  size: { width: number; height: number }
  radius: number
  topOnly: boolean
}

type SourceShape = { radius: number; topOnly?: boolean }

type OpenZoom = (
  service: Service,
  bound: string,
  ref: RefObject<View | null>,
  viewport: RefObject<View | null> | null,
  shape: SourceShape,
) => void

const OPEN = { duration: 420, easing: Easing.bezier(0.2, 0, 0, 1), reduceMotion: ReduceMotion.System }
const CLOSE = { duration: 360, easing: Easing.bezier(0.2, 0, 0, 1), reduceMotion: ReduceMotion.System }

// Module-level so every card can hide its own image without re-rendering.
const progress = makeMutable(0)
const activeBound = makeMutable<string | null>(null)

const ZoomContext = createContext<OpenZoom | null>(null)
const ViewportContext = createContext<RefObject<View | null> | null>(null)

/**
 * Marks the visible, scrolling area of a screen (inside the status bar, above the
 * tab bar). Zoom sources inside it start their animation clipped to this area.
 */
export function ZoomViewport({ children }: { children: ReactNode }) {
  const ref = useRef<View>(null)
  return (
    <ViewportContext value={ref}>
      <View ref={ref} style={styles.fill} collapsable={false}>
        {children}
      </View>
    </ViewportContext>
  )
}

// Each entry point owns its own id so one screen can show the same service twice.
export function therapyGroup(source: string, serviceId: string) {
  return `${source}.${serviceId}`
}

function measure(view: View | null): Promise<Rect | null> {
  return new Promise((resolve) => {
    if (!view) return resolve(null)
    view.measureInWindow((x, y, width, height) => resolve(width > 0 ? { x, y, width, height } : null))
  })
}

export function TherapyZoomProvider({ children }: { children: ReactNode }) {
  const container = useRef<View>(null)
  const [zoom, setZoom] = useState<Zoom | null>(null)
  const busy = useRef(false)

  const open: OpenZoom = (service, bound, ref, viewport, shape) => {
    if (busy.current) return
    busy.current = true
    Keyboard.dismiss()
    void Promise.all([
      measure(ref.current),
      measure(container.current),
      measure(viewport?.current ?? null),
    ]).then(([card, origin, area]) => {
      if (!card || !origin) {
        busy.current = false
        return
      }
      const visible = area ?? origin
      progress.set(0)
      setZoom({
        service,
        bound,
        from: { ...card, x: card.x - origin.x, y: card.y - origin.y },
        clip: { ...visible, x: visible.x - origin.x, y: visible.y - origin.y },
        size: { width: origin.width, height: origin.height },
        radius: shape.radius,
        topOnly: shape.topOnly ?? false,
      })
    })
  }

  const finish = () => {
    activeBound.set(null)
    setZoom(null)
    busy.current = false
  }

  return (
    <ZoomContext value={open}>
      <View ref={container} style={styles.fill} collapsable={false}>
        {/* Hidden from screen readers while the detail covers it. */}
        <View
          style={styles.fill}
          importantForAccessibility={zoom ? 'no-hide-descendants' : 'auto'}
          accessibilityElementsHidden={zoom !== null}
        >
          {children}
        </View>
        {zoom ? <ZoomOverlay zoom={zoom} onClosed={finish} /> : null}
      </View>
    </ZoomContext>
  )
}

function ZoomOverlay({ zoom, onClosed }: { zoom: Zoom; onClosed: () => void }) {
  const insets = useSafeAreaInsets()
  const focused = useIsFocused()
  const scrollY = useSharedValue(0)
  const { from, clip, size, radius, topOnly } = zoom
  const { width } = size

  // Start once the overlay's own copy of the image is on screen. Starting on mount
  // hid the card a frame or two before the copy finished decoding, which blinked.
  const started = useRef(false)
  const closing = useRef(false)
  const start = () => {
    // Closing wins: a late image load must not reopen a detail that is going away.
    if (started.current || closing.current) return
    started.current = true
    activeBound.set(zoom.bound)
    progress.set(withTiming(1, OPEN))
  }
  // Fallback for a missing or failed image, so the zoom never stalls.
  // Once per overlay; start() reads only refs and this overlay's fixed props.
  useEffect(() => {
    const timer = setTimeout(start, 250)
    return () => clearTimeout(timer)
  }, [])

  const close = () => {
    closing.current = true
    progress.set(
      withTiming(0, CLOSE, (finished) => {
        if (finished) scheduleOnRN(onClosed)
      }),
    )
  }

  // Only while the tabs are on top, so back on a pushed booking screen still pops it.
  useEffect(() => {
    if (!focused) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close()
      return true
    })
    return () => subscription.remove()
  })

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(Math.max(0, event.contentOffset.y))
  })

  // Grows from the source screen's visible area to the whole screen.
  const clipStyle = useAnimatedStyle(() => {
    const p = progress.get()
    return {
      left: interpolate(p, [0, 1], [clip.x, 0]),
      top: interpolate(p, [0, 1], [clip.y, 0]),
      width: interpolate(p, [0, 1], [clip.width, width]),
      height: interpolate(p, [0, 1], [clip.height, size.height]),
    }
  })

  const heroStyle = useAnimatedStyle(() => {
    const p = progress.get()
    const corner = interpolate(p, [0, 1], [radius, 0])
    // Positioned inside the clip, so subtract the clip's own moving origin.
    return {
      left: interpolate(p, [0, 1], [from.x, 0]) - interpolate(p, [0, 1], [clip.x, 0]),
      top: interpolate(p, [0, 1], [from.y, 0]) - interpolate(p, [0, 1], [clip.y, 0]),
      width: interpolate(p, [0, 1], [from.width, width]),
      height: interpolate(p, [0, 1], [from.height, HERO_HEIGHT]),
      borderTopLeftRadius: corner,
      borderTopRightRadius: corner,
      borderBottomLeftRadius: topOnly ? 0 : corner,
      borderBottomRightRadius: topOnly ? 0 : corner,
      // Follow the page while it scrolls, and carry that offset back on close.
      transform: [{ translateY: -scrollY.get() * p }],
    }
  })

  const pageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.5], [0, 1], 'clamp'),
  }))

  const contentStyle = useAnimatedStyle(() => {
    const p = progress.get()
    return {
      opacity: interpolate(p, [0.6, 1], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(p, [0.6, 1], [24, 0], 'clamp') }],
    }
  })

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.75, 1], [0, 1], 'clamp'),
  }))

  return (
    <View style={RNStyleSheet.absoluteFill} accessibilityViewIsModal>
      <Animated.View style={[RNStyleSheet.absoluteFill, styles.page, pageStyle]} />
      <Animated.ScrollView
        style={[RNStyleSheet.absoluteFill, contentStyle]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HERO_HEIGHT, paddingBottom: 96 + insets.bottom }}
      >
        <TherapySheet service={zoom.service} />
      </Animated.ScrollView>
      <Animated.View pointerEvents="none" style={[styles.clip, clipStyle]}>
        <Animated.View style={[styles.hero, heroStyle]}>
          <TherapyImage service={zoom.service} onDisplay={start} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.back, { top: insets.top + 8 }, chromeStyle]}>
        <BackLink label="Back to treatments" floating onPress={close} />
      </Animated.View>
      <Animated.View style={[styles.footer, chromeStyle]}>
        <RequestFooter service={zoom.service} bottomInset={insets.bottom} />
      </Animated.View>
    </View>
  )
}

/**
 * Wire a card up as a zoom source. Put `ref` and `imageStyle` on the view that
 * wraps the card image; `open` goes on the card's press handler.
 */
export function useZoomSource(bound: string, service: Service | null, shape: SourceShape) {
  const openZoom = use(ZoomContext)
  const viewport = use(ViewportContext)
  const ref = useRef<View>(null)
  // Hide only once the animation has started, so there is never a frame with no image.
  const imageStyle = useAnimatedStyle(() => ({
    opacity: activeBound.get() === bound && progress.get() > 0 ? 0 : 1,
  }))
  return {
    ref,
    imageStyle,
    open: () => {
      if (service) openZoom?.(service, bound, ref, viewport, shape)
    },
  }
}

const styles = StyleSheet.create((theme) => ({
  fill: {
    flex: 1,
  },
  page: {
    backgroundColor: theme.colors.background,
  },
  clip: {
    position: 'absolute',
    overflow: 'hidden',
  },
  // Transparent: until its image decodes, the real card must show through.
  hero: {
    position: 'absolute',
    overflow: 'hidden',
  },
  back: {
    position: 'absolute',
    left: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
}))
