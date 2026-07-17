import { wallpaperStore } from '@stores/wallpaper.store'
import type { EventType } from '../../types/core.types'

type RuntimeBindings = {
  onSwipeCommit?: (detail: EventType) => void
}
export default function useRuntimeBindings() {

  const replaceStale = wallpaperStore.getState().replaceStale

  const runtimeBindings: Record<string, RuntimeBindings> = {
    wallpaper: {
      onSwipeCommit: () => {
        // if (detail.type !== 'carousel') return
        // const dir = detail.direction?.dir

        setTimeout(() => {
          replaceStale('next')
          replaceStale('prev')
        }, 200)
      }
    }
  }

  return { runtimeBindings }
}