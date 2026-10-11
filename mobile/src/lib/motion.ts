import { Easing, FadeIn, FadeInDown, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated'

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1)
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1)

export const PRESS = { duration: 120, easing: EASE_OUT, reduceMotion: ReduceMotion.System }

export const GRID_LAYOUT = LinearTransition.duration(260).easing(EASE_OUT)
export const GRID_ENTER = FadeIn.duration(220).easing(EASE_OUT)
export const GRID_EXIT = FadeOut.duration(140)

export function listEnter(index: number) {
  return FadeInDown.duration(260)
    .delay(Math.min(index, 8) * 45)
    .easing(EASE_OUT)
}
