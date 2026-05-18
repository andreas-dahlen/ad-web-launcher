import type { CtxType } from '@typeScript/descriptor/ctxType'
import { useWallpaperStore } from '../../hooks/useWallpaperStore'
import type { CarouselProps } from '@typeScript/propsType'

export default function useRuntimeBindings() {

  const { replaceStale } = useWallpaperStore()

  const runtimeBindings: Record<string, Partial<CarouselProps>> = {
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