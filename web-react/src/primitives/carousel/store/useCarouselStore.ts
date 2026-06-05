import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { carouselStore, type CarouselStore } from './carouselStore'
import { debugRegisterBinding, debugUnregisterBinding } from '../../../test/functions'

const DEFAULTS = {
  index: 0,
  count: 0,
  liveOffset: 0,
  dragging: false,
  layout: {
    containerSize: { width: 0, height: 0 },
    itemSize: { width: 0, height: 0 }
  },
  settling: false,
  pendingDir: null
} as const

export const useCarouselStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useCarouselStore')
    carouselStore.getState().init(id, DEFAULTS)
    return () => {
      debugUnregisterBinding(id, 'useCarouselStore')
      carouselStore.getState().delete(id)
    }
  }, [id])

  return carouselStore(
    useShallow((s: CarouselStore) => s.bindings[id] ?? DEFAULTS)
  ) //TODO remove useShallow?
}