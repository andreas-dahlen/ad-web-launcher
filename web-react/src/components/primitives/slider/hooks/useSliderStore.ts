import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { sliderStore, type SliderStore } from '@stores/sliderStore.ts'
import { debugRegisterBinding, debugUnregisterBinding } from '@debug/functions'

const DEFAULTS = {
  value: 0,
  min: 0,
  max: 100,
  size: { x: 0, y: 0 },
  thumbSize: { x: 0, y: 0 },
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
  )
}