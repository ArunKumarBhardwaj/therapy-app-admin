import { Image } from 'expo-image'
import { StyleSheet } from 'react-native-unistyles'
import { mediaUrl } from '@/features/therapies/api'
import type { Service } from '@/lib/domain'

// No fade-in: the zoom overlay draws a second copy over the card, and a fade would show as a blink.
export function TherapyImage({ service, onDisplay }: { service: Service; onDisplay?: () => void }) {
  const uri = mediaUrl(service.imagePath)
  return (
    <Image
      source={uri ? { uri } : null}
      style={styles.fill}
      contentFit="cover"
      cachePolicy="memory-disk"
      onDisplay={onDisplay}
      accessibilityIgnoresInvertColors
    />
  )
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
})
