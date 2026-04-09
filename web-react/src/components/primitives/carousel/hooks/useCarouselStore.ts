import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { carouselStore, type CarouselStore } from '@interaction/stores/carouselStore.ts'

const DEFAULTS = {
  index: 0,
  count: 0,
  offset: 0,
  dragging: false,
  size: { x: 0, y: 0 },
  settling: false,
  pendingDir: null
} as const

export const useCarouselStore = (id: string) => {

  useEffect(() => {
    carouselStore.getState().init(id)
    return () => carouselStore.getState().delete(id)
  }, [id])

  return carouselStore(
    useShallow((s: CarouselStore) => s.bindings[id] ?? DEFAULTS)
  )
}