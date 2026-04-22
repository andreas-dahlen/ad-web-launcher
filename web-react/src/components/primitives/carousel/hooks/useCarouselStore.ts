import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { carouselStore, type CarouselStore } from '../../../../stores/carouselStore'
import { debugRegisterBinding, debugUnregisterBinding } from '@debug/functions'

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
    debugRegisterBinding(id, 'useCarouselStore')
    carouselStore.getState().init(id)
    return () => {
      debugUnregisterBinding(id, 'useCarouselStore')
      carouselStore.getState().delete(id)
    }
  }, [id])

  return carouselStore(
    useShallow((s: CarouselStore) => s.bindings[id] ?? DEFAULTS)
  )
}