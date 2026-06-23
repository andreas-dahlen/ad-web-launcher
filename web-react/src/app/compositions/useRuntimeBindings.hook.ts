import { wallpaperStore } from '@stores/wallpaper.store'
import type { EventType } from '@typing/core.types'

type RuntimeBindings = {
  onSwipeCommit?: (detail: EventType) => void
}
export default function useRuntimeBindings() {

  const replaceStale = wallpaperStore.getState().replaceStale

  const runtimeBindings: Record<string, RuntimeBindings> = {
    wallpaper: {
      onSwipeCommit: (detail: EventType) => {
        if (detail.type !== 'carousel') return
        const dir = detail.direction?.dir

        setTimeout(() => {
          if (dir === 'up') replaceStale('next')
          if (dir === 'down') replaceStale('prev')
        }, 200)
      }
    }
  }

  return { runtimeBindings }
}