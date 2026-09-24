import { Dimensions } from 'react-native'

const GUIDELINE_WIDTH = 393
const GUIDELINE_HEIGHT = 852

const { width, height } = Dimensions.get('window')
const shortSide = Math.min(width, height)
const longSide = Math.max(width, height)

export const scale = (size: number) => (shortSide / GUIDELINE_WIDTH) * size

export const verticalScale = (size: number) => (longSide / GUIDELINE_HEIGHT) * size

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor

export const moderateVerticalScale = (size: number, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor

export {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  moderateVerticalScale as mvs,
}
