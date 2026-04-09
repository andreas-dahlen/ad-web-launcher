import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { sliderStore, type SliderStore } from '@interaction/stores/sliderStore.ts'

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
    sliderStore.getState().init(id)
    return () => sliderStore.getState().delete(id)
  }, [id])

  return sliderStore(
    useShallow((s: SliderStore) => s.bindings[id] ?? DEFAULTS)
  )
}