import type { ReactNode } from 'react'
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { PRESS } from '@/lib/motion'

type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

export function PressableScale({ style, children, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1)
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }))

  return (
    <Pressable
      hitSlop={8}
      pressRetentionOffset={16}
      onPressIn={(event) => {
        scale.set(withTiming(0.97, PRESS))
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        scale.set(withTiming(1, PRESS))
        onPressOut?.(event)
      }}
      {...rest}
    >
      <Animated.View style={[style, animated]}>{children}</Animated.View>
    </Pressable>
  )
}
