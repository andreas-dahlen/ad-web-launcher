import { useMemo } from 'react'
import EmptyPlaceholder from '@scenes/EmptyPlaceholder.js'

export function useAugmentedScenes(
  scenes: React.ComponentType[],
  interactive: boolean,
  targetLength?: number
) {
  return useMemo(() => {
    if (!interactive) return scenes

    const length = targetLength ?? scenes.length
    const augmented: React.ComponentType[] = []

    while (augmented.length < length) {
      augmented.push(EmptyPlaceholder)
    }

    return augmented
  }, [scenes, interactive, targetLength])
}