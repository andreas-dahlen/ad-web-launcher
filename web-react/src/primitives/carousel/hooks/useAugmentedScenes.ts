import { useMemo } from 'react'
import EmptyPlaceholder from '@app/scenes/EmptyPlaceholder'

export function useAugmentedScenes(
  scenes: React.ComponentType[],
  targetLength?: number
) {
  return useMemo(() => {
    if (scenes.length > 0) return scenes

    const length = targetLength ?? scenes.length
    const augmented: React.ComponentType[] = []

    while (augmented.length < length) {
      augmented.push(EmptyPlaceholder)
    }

    return augmented
  }, [scenes, targetLength])
}