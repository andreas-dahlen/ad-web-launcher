import { carouselStore, type CarouselStore } from '@interaction/zunstand/carouselState'

const DEFAULTS = {
  index: 0,
  count: 0,
  offset: 0,
  dragging: false,
  size: { x: 0, y: 0 },
  settling: false,
  pendingDir: null
} as const

export const useCarouselZustand = (id: string) => {

  carouselStore.getState().init(id)
  return carouselStore(
    (s: CarouselStore) => s.carouselStore[id] ?? DEFAULTS
  )
}