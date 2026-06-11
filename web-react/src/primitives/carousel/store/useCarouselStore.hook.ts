import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { carouselStore, type CarouselStore } from './carousel.store'
import { debugRegisterBinding, debugUnregisterBinding } from '../../../test/functions.debug'

export const carousel_DEFAULTS = {
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
    carouselStore.getState().init(id, carousel_DEFAULTS)
    return () => {
      debugUnregisterBinding(id, 'useCarouselStore')
      carouselStore.getState().delete(id)
    }
  }, [id])

  return carouselStore(
    useShallow((s: CarouselStore) => s.bindings[id] ?? carousel_DEFAULTS)
  ) //TODO remove useShallow?
}