import { sliderStore, type SliderStore } from '@interaction/zunstand/sliderState'

const DEFAULTS = {
  value: 0,
  offset: 0,
  min: 0,
  max: 100,
  size: { x: 0, y: 0 },
  thumbSize: { x: 0, y: 0 },
  dragging: false
} as const

export const useSliderZustand = (id: string) => {

  sliderStore.getState().init(id)
  return sliderStore(
    (s: SliderStore) => s.sliderStore[id] ?? DEFAULTS
  )
}
