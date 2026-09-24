import { Easing, FadeInDown, ReduceMotion, SharedTransition } from 'react-native-reanimated'

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1)
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1)

export const PRESS = { duration: 120, easing: EASE_OUT, reduceMotion: ReduceMotion.System }

export const THERAPY_TRANSITION = SharedTransition.duration(420)
  .easing(EASE_IN_OUT)
  .reduceMotion(ReduceMotion.System)

export const DETAIL_ENTER = FadeInDown.duration(280).delay(140).easing(EASE_OUT)

export function listEnter(index: number) {
  return FadeInDown.duration(260)
    .delay(Math.min(index, 8) * 45)
    .easing(EASE_OUT)
}

export function therapyTag(slug: string) {
  return `therapy-image-${slug}`
}
