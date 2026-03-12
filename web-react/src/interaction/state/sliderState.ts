import { reactive, computed, readonly, ComputedRef } from 'vue'
import type { Descriptor, VecOrScalar } from '../../types/gestures.ts'

/* -------------------------------------------------
Slider store types
------------------------------------------------- */
interface SliderData {
  value: VecOrScalar | null          // logical position
  offset: VecOrScalar | null         // live drag offset
  min: number
  max: number
  size: number
  thumbSize?: number
  dragging?: boolean
}

type SliderMap = Record<string, SliderData>

interface SliderView {
  value: ComputedRef<VecOrScalar | null>
  offset: ComputedRef<VecOrScalar | null>
  dragging: ComputedRef<boolean | undefined>
}

/* -------------------------------------------------
Reactive store
------------------------------------------------- */
const sliderState = reactive<{ sliders: SliderMap }>({
  sliders: {}
})

const laneViews: Record<string, SliderView> = {}

/* -------------------------------------------------
Slider state functions
------------------------------------------------- */
export const sliderStateFn = {
  getSize(id: string): number {
    return sliderState.sliders[id]?.size ?? 0
  },

  getThumbSize(id: string): number {
    return sliderState.sliders[id]?.thumbSize ?? 0
  },

  getConstraints(id: string): { min: number; max: number } {
    const slider = sliderState.sliders[id]
    return {
      min: slider?.min ?? 0,
      max: slider?.max ?? 100
    }
  },

  getPosition(id: string): VecOrScalar | null {
    return sliderState.sliders[id]?.value ?? 0
  },

  get(id: string): SliderView {
    const lane = this.ensure(id)

    if (!laneViews[id]) {
      laneViews[id] = readonly({
        value: computed(() => lane.value),
        offset: computed(() => lane.offset),
        dragging: computed(() => lane.dragging)
      })
    }
    return laneViews[id]
  },

  ensure(id: string): SliderData {
    if (!sliderState.sliders[id]) {
      sliderState.sliders[id] = {
        value: 0,
        offset: 0,
        min: 0,
        max: 100,
        size: 0
      }
    }
    return sliderState.sliders[id]
  },

  setConstraints(id: string, packet: { min: number; max: number }): void {
    const slider = this.ensure(id)
    slider.min = packet.min
    slider.max = packet.max
  },

  setSize(id: string, size: number): void {
    this.ensure(id).size = size
  },

  setThumbSize(id: string, thumbSize: number): void {
    this.ensure(id).thumbSize = thumbSize
  },

  /* -------------------------------------------------
     Dispatcher Actions
  ------------------------------------------------- */
  press(desc: Descriptor): void {
    const slider = this.ensure(desc.id)
    slider.value = desc.delta ?? slider.value
  },

  swipeStart(desc: Descriptor): void {
    const slider = this.ensure(desc.id)
    slider.dragging = true
    slider.value = desc.delta ?? slider.value
  },

  swipe(desc: Descriptor): void {
    const slider = this.ensure(desc.id)
    slider.value = desc.delta ?? slider.value
  },

  swipeCommit(desc: Descriptor): void {
    const slider = this.ensure(desc.id)
    slider.value = desc.delta ?? slider.value
    slider.dragging = false
  }
}