import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { sliderStore, type SliderStore } from '@primitives/slider/store/sliderStore'
import { debugRegisterBinding, debugUnregisterBinding } from '@test/functions'

const DEFAULTS = {
  value: 0,
  min: 0,
  max: 100,
  containerSize: { width: 0, height: 0 },
  thumbSize: { width: 0, height: 0 },
  dragging: false
} as const

export const useSliderStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useSliderStore')
    sliderStore.getState().init(id)
    return () => {
      debugUnregisterBinding(id, 'useSliderStore')
      sliderStore.getState().delete(id)
    }
  }, [id])

  return sliderStore(
    useShallow((s: SliderStore) => s.bindings[id] ?? DEFAULTS)
  ) //TODO remove useShallow?
}