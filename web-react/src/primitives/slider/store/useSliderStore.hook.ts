import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { sliderStore, type SliderStore } from '@primitives/slider/store/slider.store'
import { debugRegisterBinding, debugUnregisterBinding } from '@test/functions.debug'

const DEFAULTS = {
  value: 0,
  min: 0,
  max: 100,
  containerSize: { width: 0, height: 0 },
  itemSize: { width: 0, height: 0 },
  dragging: false,
  layout: {
    containerSize: { width: 0, height: 0 },
    itemSize: { width: 0, height: 0 },
  }
} as const

export const useSliderStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useSliderStore')
    sliderStore.getState().init(id, DEFAULTS)
    return () => {
      debugUnregisterBinding(id, 'useSliderStore')
      sliderStore.getState().delete(id)
    }
  }, [id])

  return sliderStore(
    useShallow((s: SliderStore) => s.bindings[id] ?? DEFAULTS)
  ) //TODO remove useShallow?
}