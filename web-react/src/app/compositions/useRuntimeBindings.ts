import type { CtxType } from '@typeScript/descriptor/ctxType'
import { useWallpaperStore } from '../../hooks/useWallpaperStore'

type RuntimeBindings = {
  onSwipeCommit?: (detail: CtxType) => void
}
export default function useRuntimeBindings() {

  const { replaceStale } = useWallpaperStore()

  const runtimeBindings: Record<string, RuntimeBindings> = {
    wallpaper: {
      onSwipeCommit: (detail: CtxType) => {
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