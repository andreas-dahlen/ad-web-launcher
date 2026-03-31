import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { SliderDescriptor } from "@interaction/types/meta"
import type { Vec2 } from '@interaction/types/primitives'

type Slider = {
  //react motion
  value: number         // logical position
  offset: number        // live drag offset

  //react sizing
  min: number
  max: number
  size: Vec2

  // the optional section non reactive
  thumbSize: Vec2
  dragging?: boolean

}

export type SliderStore = {
  sliderStore: Record<string, Slider>
  init: (id: string) => void
  get: (id: string) => Readonly<Slider>
  setConstraints: (id: string, constraints: { min: number, max: number }) => void
  setSize: (id: string, size: Vec2) => void
  setThumbSize: (id: string, thumbSize: Vec2) => void
  press: (desc: SliderDescriptor) => void
  swipeStart: (desc: SliderDescriptor) => void
  swipe: (desc: SliderDescriptor) => void
  swipeCommit: (desc: SliderDescriptor) => void
}
/* -------------------------------
   Slider state functions
--------------------------------- */
export const sliderStore = create<SliderStore>()(
  immer((set, get) => ({

    sliderStore: {},

    init: (id) => {
      if (get().sliderStore[id]) return

      set(state => {
        state.sliderStore[id] = {
          value: 0,
          offset: 0,
          min: 0,
          max: 100,
          size: { x: 0, y: 0 },
          thumbSize: { x: 0, y: 0 }
        }
      })
    },
    get: (id) => {
      return Object.freeze(get().sliderStore[id])
    },

    setConstraints: (id, packet) => {
      set(state => {
        const s = state.sliderStore[id]
        s.min = packet.min;
        s.max = packet.max;
      })
    },

    setSize: (id, size) => {
      set(state => {
        state.sliderStore[id].size = size

      })
    },
    setThumbSize: (id, thumbSize) => {
      set(state => {
        const s = state.sliderStore[id]
        if (thumbSize !== undefined) s.thumbSize = thumbSize;
      })
    },
    press: (desc) => {
      set(state => {
        const s = state.sliderStore[desc.base.id]
        s.value = desc.solutions.delta1D ?? s.value
      })
    },
    swipeStart: (desc) => {
      set(state => {
        const s = state.sliderStore[desc.base.id]
        s.dragging = true
        s.value = desc.solutions.delta1D ?? s.value
      })
    },
    swipe: (desc) => {
      set(state => {
        const s = state.sliderStore[desc.base.id]
        s.value = desc.solutions.delta1D ?? s.value
      })
    },
    swipeCommit: (desc) => {
      set(state => {
        const s = state.sliderStore[desc.base.id]
        s.dragging = false
        s.value = desc.solutions.delta1D ?? s.value
      })
    },
  })
  )
)